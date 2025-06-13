document.addEventListener("DOMContentLoaded", () => {
  // --- 1. INITIALIZATION ---
  let cart = {};
  
  // --- A. SIMULATE FETCHED DATA ---
  // In a real application, you would fetch this from your backend using the customer's ID.
  // This array holds the product IDs of items the customer has purchased before.
  const purchasedProductIds = ['1', '3']; // Example: User has bought product 1 and 3 before.

  // --- B. DOM ELEMENT REFERENCES ---
  const productGrid = document.getElementById("product-grid");
  const totalPriceDisplay = document.getElementById("total-price");
  const buyBtn = document.getElementById("buy-btn");
  const buyBtnText = document.getElementById("buy-btn-text");
  const filterBtn = document.getElementById("filter-purchased-btn"); // Get the new filter button

  // --- C. FILTER STATE ---
  let filterIsActive = false;


  // --- 2. EVENT HANDLING ---

  // Event handler for the product grid (add/remove items)
  productGrid.addEventListener("click", (event) => {
    const target = event.target;
    const productCard = target.closest(".product-card");
    if (!productCard) return;

    const productId = productCard.dataset.productId;
    const stock = parseInt(productCard.dataset.stock);
    const quantityValueEl = productCard.querySelector(".quantity-value");
    let currentQuantity = cart[productId] || 0;

    if (target.closest(".quantity-plus")) {
      if (currentQuantity < stock) {
        currentQuantity++;
      } else {
        alert("You cannot add more than the available stock!");
      }
    }

    if (target.closest(".quantity-minus")) {
      if (currentQuantity > 0) {
        currentQuantity--;
      }
    }

    cart[productId] = currentQuantity;
    if (cart[productId] === 0) {
      delete cart[productId];
    }
    quantityValueEl.textContent = currentQuantity;

    updateTotal();
  });

  // --- NEW: Event handler for the filter button ---
  filterBtn.addEventListener('click', () => {
      filterIsActive = !filterIsActive; // Toggle the filter state
      applyProductFilter();

      // Update button appearance to show current state
      if (filterIsActive) {
          filterBtn.textContent = 'Show All Products';
          filterBtn.classList.add('bg-slate-600', 'hover:bg-slate-700');
          filterBtn.classList.remove('bg-[#3490f3]', 'hover:bg-[#2579d5]');
      } else {
          filterBtn.textContent = 'Show My Purchases';
          filterBtn.classList.remove('bg-slate-600', 'hover:bg-slate-700');
          filterBtn.classList.add('bg-[#3490f3]', 'hover:bg-[#2579d5]');
      }
  });

  // Event handler for the "Buy Now" button
  buyBtn.addEventListener("click", () => {
    if (Object.keys(cart).length === 0) {
      alert("Your cart is empty. Please add some products to buy.");
      return;
    }

    const orderData = Object.keys(cart).map((productId) => ({
      productId: productId,
      quantity: cart[productId],
    }));

    buyBtn.disabled = true;
    buyBtnText.textContent = "Processing...";
    
    console.log("Sending POST request to backend with this data:", orderData);
    setTimeout(() => {
      alert("Purchase successful! Check your receipt page for details.");
      cart = {};
      document.querySelectorAll(".quantity-value").forEach((el) => {
        el.textContent = "0";
      });
      updateTotal();
      buyBtn.disabled = false;
      buyBtnText.textContent = "Buy Now";
    }, 2000);
  });


  // --- 3. FUNCTIONS ---
  
  // --- NEW: Function to apply or remove the filter ---
  function applyProductFilter() {
      const allProductCards = document.querySelectorAll('.product-card');
      allProductCards.forEach(card => {
          const productId = card.dataset.productId;

          if (filterIsActive) {
              // If filter is ON, show the card only if its ID is in the purchased list
              if (purchasedProductIds.includes(productId)) {
                  card.style.display = 'flex';
              } else {
                  card.style.display = 'none';
              }
          } else {
              // If filter is OFF, show all cards
              card.style.display = 'flex';
          }
      });
  }

  // Function to update the total price
  function updateTotal() {
    let total = 0;
    for (const productId in cart) {
      const quantity = cart[productId];
      const productCard = document.querySelector(
        `.product-card[data-product-id='${productId}']`
      );
      const price = parseFloat(productCard.dataset.price);
      total += price * quantity;
    }
    totalPriceDisplay.textContent = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(total);
  }
});