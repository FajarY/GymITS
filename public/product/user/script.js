import { getAllProduct, purchaseProducts } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", async () => {
  const productGrid = document.getElementById("product-grid");
  const totalPriceEl = document.getElementById("total-price");
  const buyBtn = document.getElementById("buy-btn");
  const buyBtnText = document.getElementById("buy-btn-text");

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
      productGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">No products available.</p>`;
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
      const price = parseFloat(card.dataset.price);
      const quantity = parseInt(
        card.querySelector(".quantity-value").textContent
      );
      totalPrice += price * quantity;
    });
    totalPriceEl.textContent = formatCurrency(totalPrice);
  };

  const setupEventListeners = () => {
    productGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card");
      if (!card) return;

      const quantityEl = card.querySelector(".quantity-value");
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
        const quantity = parseInt(
          card.querySelector(".quantity-value").textContent
        );
        if (quantity > 0) {
          purchaseList.push({
            id: card.dataset.productId,
            amount: quantity,
          });
        }
      });

      if (purchaseList.length === 0) {
        alert("Your cart is empty.");
        return;
      }

      const productsCart = {
        purchase: purchaseList,
      };

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
        console.error("Purchase Error:", error);
        alert(`Error: ${error.message}`);
      } finally {
        buyBtn.disabled = false;
        buyBtnText.textContent = "Buy Now";
      }
    });
  };

  try {
    const [res, data] = await getAllProduct();

    if (res.ok && data.status) {
      const productsData = data.data;
      renderProducts(productsData);
      setupEventListeners();
    } else {
      throw new Error(
        data.message || "Could not retrieve products from server."
      );
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    productGrid.innerHTML = `<p class="col-span-full text-center text-red-500 p-4 bg-red-100 rounded-lg">Error: ${error.message}</p>`;
  }
});
