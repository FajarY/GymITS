document.addEventListener('DOMContentLoaded', () => {
  // --- Get all necessary elements from the DOM ---
  const createProductBtn = document.getElementById('create-product-btn');
  const createProductModal = document.getElementById('create-product-modal');
  const createProductForm = document.getElementById('create-product-form');
  const cancelCreateBtn = document.getElementById('cancel-create-btn');

  const addStockModal = document.getElementById('add-stock-modal');
  const addStockForm = document.getElementById('add-stock-form');
  const cancelStockBtn = document.getElementById('cancel-stock-btn');
  const stockProductName = document.getElementById('stock-product-name');
  const stockProductIdInput = document.getElementById('stockProductId');

  const productListContainer = document.getElementById('product-list');

  // --- Event Listeners to OPEN modals ---
  createProductBtn.addEventListener('click', () => {
    createProductModal.classList.remove('hidden');
  });

  // Use event delegation to handle clicks on "Add Stock" buttons
  productListContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('add-stock-btn')) {
          const card = event.target.closest('.product-card');
          const productId = card.dataset.productId;
          const productName = card.querySelector('.product-name').textContent;

          // Set data for the modal
          stockProductName.textContent = productName;
          stockProductIdInput.value = productId;
          
          addStockModal.classList.remove('hidden');
      }
  });

  // --- Event Listeners to CLOSE modals ---
  function closeModal() {
    createProductModal.classList.add('hidden');
    addStockModal.classList.add('hidden');
  }
  cancelCreateBtn.addEventListener('click', closeModal);
  cancelStockBtn.addEventListener('click', closeModal);
  createProductModal.addEventListener('click', (e) => e.target === createProductModal && closeModal());
  addStockModal.addEventListener('click', (e) => e.target === addStockModal && closeModal());

  // --- Handle FORM Submissions ---

  // 1. Create Product Form
  createProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;

    // Simulate sending to backend and getting a new ID
    const newProductId = Date.now(); // Use timestamp as a unique ID for this example
    console.log(`Creating product: ${name}, Price: ${price}, ID: ${newProductId}`);
    
    // Create the new product card HTML
    const newCard = document.createElement('div');
    newCard.className = 'product-card flex flex-col bg-white rounded-lg shadow-md overflow-hidden';
    newCard.setAttribute('data-product-id', newProductId);
    newCard.innerHTML = `
      <img src="https://placehold.co/400x300/3490f3/white?text=Gym+Product" alt="Product Image" class="w-full h-48 object-cover">
      <div class="p-6 flex-grow flex flex-col">
          <div class="flex-grow">
              <h3 class="product-name text-xl font-bold text-[#0d141c]">${name}</h3>
              <p class="product-price text-lg font-semibold text-gray-700 mt-2">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)}</p>
              <p class="text-sm text-gray-500 mt-2">Current Stock: <span class="product-stock font-bold">0</span></p>
          </div>
          <button class="add-stock-btn mt-6 w-full h-12 cursor-pointer rounded-lg bg-slate-200 text-slate-800 font-medium transition hover:bg-slate-300">
              Add Stock
          </button>
      </div>
    `;

    // Add the new card to the list and reset the form
    productListContainer.appendChild(newCard);
    createProductForm.reset();
    closeModal();
  });


  // 2. Add Stock Form
  addStockForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const productId = stockProductIdInput.value;
    const quantity = parseInt(document.getElementById('stockQuantity').value, 10);

    console.log(`Adding ${quantity} stock to product ID: ${productId}`);

    // Find the correct product card to update
    const productCardToUpdate = document.querySelector(`.product-card[data-product-id='${productId}']`);
    if (productCardToUpdate) {
      const stockElement = productCardToUpdate.querySelector('.product-stock');
      const currentStock = parseInt(stockElement.textContent, 10);
      stockElement.textContent = currentStock + quantity;
    }
    
    addStockForm.reset();
    closeModal();
  });
});
