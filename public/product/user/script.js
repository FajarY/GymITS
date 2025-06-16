import {
  getAllProduct,
  purchaseProducts,
  getBoughtProducts,
} from "../../requestScript.js";

const  getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return value;
  }
  return null;
}

const parseJwt = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

if (parseJwt(getCookie("token")) == null || parseJwt(getCookie("token")).role != 'customer') {
    window.location.href = '/login/'
}

document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("product-grid");
  const totalPriceEl = document.getElementById("total-price");
  const buyBtn = document.getElementById("buy-btn");
  const buyBtnText = document.getElementById("buy-btn-text");
  const filterBtn = document.getElementById("filter-purchased-btn");

  let isPurchasedViewActive = false;

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const renderProducts = (products) => {
    productGrid.innerHTML = "";
    if (!products || products.length === 0) {
      const message = isPurchasedViewActive
        ? "You have not purchased any products yet."
        : "No products available.";
      productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">${message}</p>`;
      return;
    }

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className =
        "product-card flex flex-col bg-white rounded-lg shadow-md overflow-hidden";
      card.dataset.productId = product.id;
      card.dataset.price = product.price;
      card.dataset.stock = product.stock;

      card.innerHTML = `
        <img src="https://placehold.co/400x300/3490f3/white?text=${encodeURIComponent(
          product.name
        )}" alt="${product.name}" class="w-full h-48 object-cover">
        <div class="p-6 flex-grow flex flex-col">
          <div class="flex-grow">
            <h3 class="text-xl font-bold text-[#0d141c]">${product.name}</h3>
            <p class="text-lg font-semibold text-[#3490f3] mt-2">${formatCurrency(
              product.price
            )}</p>
            <p class="text-sm text-gray-500 mt-1">Stock: ${product.stock}</p>
          </div>
          <div class="mt-6 flex items-center justify-center gap-4">
            <button class="quantity-minus size-10 rounded-full bg-slate-200 text-2xl font-bold text-slate-700 transition hover:bg-slate-300">-</button>
            <span class="quantity-value text-2xl font-bold text-[#0d141c] w-10 text-center">0</span>
            <button class="quantity-plus size-10 rounded-full bg-slate-200 text-2xl font-bold text-slate-700 transition hover:bg-slate-300">+</button>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });
  };

  const updateTotalPrice = () => {
    let totalPrice = 0;
    document.querySelectorAll(".product-card").forEach((card) => {
      const quantityEl = card.querySelector(".quantity-value");
      if (quantityEl) {
        const price = parseFloat(card.dataset.price);
        const quantity = parseInt(quantityEl.textContent);
        totalPrice += price * quantity;
      }
    });
    totalPriceEl.textContent = formatCurrency(totalPrice);
  };

  const loadProducts = async () => {
    productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">Loading products...</p>`;
    filterBtn.disabled = true;

    try {
      let res, data;
      if (isPurchasedViewActive) {
        [res, data] = await getBoughtProducts();
      } else {
        [res, data] = await getAllProduct();
      }

      if (res.ok && data.status) {
        renderProducts(data.data);
        updateTotalPrice();
      } else {
        throw new Error(data.message || "Could not retrieve products.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      productGrid.innerHTML = `<p class="col-span-full text-center text-red-500 p-4 bg-red-100 rounded-lg">${error.message}</p>`;
    } finally {
      filterBtn.disabled = false;
    }
  };

  const setupEventListeners = () => {
    productGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      if (!card) return;

      const quantityEl = card.querySelector(".quantity-value");
      if (!quantityEl) return;

      let quantity = parseInt(quantityEl.textContent);
      const stock = parseInt(card.dataset.stock);

      if (e.target.classList.contains("quantity-plus") && quantity < stock) {
        quantity++;
      } else if (
        e.target.classList.contains("quantity-minus") &&
        quantity > 0
      ) {
        quantity--;
      }

      quantityEl.textContent = quantity;
      updateTotalPrice();
    });

    buyBtn.addEventListener("click", async () => {
      const purchaseList = [];
      document.querySelectorAll(".product-card").forEach((card) => {
        const quantityEl = card.querySelector(".quantity-value");
        if (quantityEl && parseInt(quantityEl.textContent) > 0) {
          purchaseList.push({
            id: card.dataset.productId,
            amount: parseInt(quantityEl.textContent),
          });
        }
      });

      if (purchaseList.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      const productsCart = { purchase: purchaseList };
      buyBtn.disabled = true;
      buyBtnText.textContent = "Processing...";

      try {
        const [res, data] = await purchaseProducts(productsCart);

        if (res.ok && data.status) {
          alert(data.message || "Purchase successful!");
          location.reload();
        } else {
          throw new Error(data.message || "Purchase failed.");
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        buyBtn.disabled = false;
        buyBtnText.textContent = "Buy Now";
      }
    });

    filterBtn.addEventListener("click", () => {
      isPurchasedViewActive = !isPurchasedViewActive;

      if (isPurchasedViewActive) {
        filterBtn.textContent = "Show All Products";
        filterBtn.classList.replace("bg-[#3490f3]", "bg-slate-600");
        filterBtn.classList.replace("hover:bg-[#2579d5]", "hover:bg-slate-700");
      } else {
        filterBtn.textContent = "Show My Purchases";
        filterBtn.classList.replace("bg-slate-600", "bg-[#3490f3]");
        filterBtn.classList.replace("hover:bg-slate-700", "hover:bg-[#2579d5]");
      }

      loadProducts();
    });
  };

  setupEventListeners();
  loadProducts();
});
