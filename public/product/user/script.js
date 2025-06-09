document.addEventListener("DOMContentLoaded", () => {
  // --- 1. INITIALIZATION ---

  // The 'cart' object will store the quantity of each product the user wants to buy.
  // The key is the product ID, and the value is the quantity.
  // e.g., { '1': 2, '3': 1 } means 2 of product #1 and 1 of product #3.
  let cart = {};

  const productGrid = document.getElementById("product-grid");
  const totalPriceDisplay = document.getElementById("total-price");
  const buyBtn = document.getElementById("buy-btn");
  const buyBtnText = document.getElementById("buy-btn-text");

  // --- 2. EVENT HANDLING USING EVENT DELEGATION ---
  // Instead of adding a listener to every single button, we add one to the parent container.
  productGrid.addEventListener("click", (event) => {
    const target = event.target;

    // Find the product card that the clicked button belongs to.
    const productCard = target.closest(".product-card");
    if (!productCard) return; // Exit if the click was not inside a product card

    const productId = productCard.dataset.productId;
    const stock = parseInt(productCard.dataset.stock);
    const quantityValueEl = productCard.querySelector(".quantity-value");
    let currentQuantity = cart[productId] || 0;

    // Check if the PLUS button was clicked
    if (target.closest(".quantity-plus")) {
      if (currentQuantity < stock) {
        currentQuantity++;
      } else {
        alert("You cannot add more than the available stock!");
      }
    }

    // Check if the MINUS button was clicked
    if (target.closest(".quantity-minus")) {
      if (currentQuantity > 0) {
        currentQuantity--;
      }
    }

    // Update the cart object and the display
    cart[productId] = currentQuantity;
    quantityValueEl.textContent = currentQuantity;

    // If a product quantity becomes 0, remove it from the cart
    if (cart[productId] === 0) {
      delete cart[productId];
    }

    // Recalculate and display the total price
    updateTotal();
  });

  // --- 3. CALCULATE AND UPDATE TOTAL PRICE ---
  function updateTotal() {
    let total = 0;
    const allProductCards = document.querySelectorAll(".product-card");

    // Loop through our cart object
    for (const productId in cart) {
      const quantity = cart[productId];
      // Find the corresponding product card to get its price
      const productCard = document.querySelector(
        `.product-card[data-product-id='${productId}']`
      );
      const price = parseFloat(productCard.dataset.price);
      total += price * quantity;
    }

    // Format the total as Indonesian Rupiah (IDR) and update the display
    totalPriceDisplay.textContent = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(total);
  }

  // --- 4. HANDLE THE 'BUY' BUTTON CLICK ---
  buyBtn.addEventListener("click", () => {
    // Check if the cart is empty
    if (Object.keys(cart).length === 0) {
      alert("Your cart is empty. Please add some products to buy.");
      return;
    }

    // Prepare data for the backend. The format is an array of objects.
    const orderData = Object.keys(cart).map((productId) => ({
      productId: productId,
      quantity: cart[productId],
    }));

    // Give visual feedback
    buyBtn.disabled = true;
    buyBtnText.textContent = "Processing...";

    // Simulate a POST request to the backend
    console.log("Sending POST request to backend with this data:", orderData);
    setTimeout(() => {
      // On success from the backend:
      alert(
        "Purchase successful! Check your receipt page for details."
      );

      // Reset the state
      cart = {};
      document.querySelectorAll(".quantity-value").forEach((el) => {
        el.textContent = "0";
      });
      updateTotal();

      // Re-enable the button
      buyBtn.disabled = false;
      buyBtnText.textContent = "Buy Now";
    }, 2000); // 2-second delay to simulate network
  });
});
