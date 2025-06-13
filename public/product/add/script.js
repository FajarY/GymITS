document.addEventListener('DOMContentLoaded', () => {
  // --- Mendapatkan semua elemen yang diperlukan dari DOM ---
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

  // --- Event Listener untuk MEMBUKA modal ---
  createProductBtn.addEventListener('click', () => {
    createProductModal.classList.remove('hidden');
  });

  // Menggunakan event delegation untuk menangani klik pada tombol "Add Stock"
  productListContainer.addEventListener('click', (event) => {
      // Kita hanya peduli pada tombol "Add Stock" di sini. Tombol "Detail" adalah link dan berfungsi sendiri.
      if (event.target.classList.contains('add-stock-btn')) {
          const card = event.target.closest('.product-card');
          const productId = card.dataset.productId;
          const productName = card.querySelector('.product-name').textContent;

          // Mengatur data untuk modal
          stockProductName.textContent = productName;
          stockProductIdInput.value = productId;
          
          addStockModal.classList.remove('hidden');
      }
  });

  // --- Event Listener untuk MENUTUP modal ---
  function closeModal() {
    createProductModal.classList.add('hidden');
    addStockModal.classList.add('hidden');
  }
  cancelCreateBtn.addEventListener('click', closeModal);
  cancelStockBtn.addEventListener('click', closeModal);
  createProductModal.addEventListener('click', (e) => e.target === createProductModal && closeModal());
  addStockModal.addEventListener('click', (e) => e.target === addStockModal && closeModal());

  // --- Menangani Pengiriman FORM ---

  // 1. Form Pembuatan Produk
  createProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);

    // --- ATURAN VALIDASI untuk Harga ---
    if (price < 0 || price > 99999999) {
        alert("Error: Harga harus antara 0 dan 99,999,999.");
        return; // Hentikan fungsi
    }

    // Simulasi pengiriman ke backend dan mendapatkan ID baru
    const newProductId = Date.now(); // Gunakan timestamp sebagai ID unik untuk contoh ini
    console.log(`Membuat produk: ${name}, Harga: ${price}, ID: ${newProductId}`);
    
    // Membuat HTML kartu produk baru dengan kedua tombol
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
          <div class="mt-6 flex flex-col sm:flex-row gap-2">
            <button class="add-stock-btn w-full px-4 py-3 rounded-lg bg-slate-200 text-slate-800 font-medium transition hover:bg-slate-300">
                Add Stock
            </button>
            <a href="/product/add/detail/?id=${newProductId}" class="detail-btn w-full px-4 py-3 rounded-lg bg-indigo-500 text-white font-medium transition hover:bg-indigo-600 text-center flex items-center justify-center">
                Detail
            </a>
          </div>
      </div>
    `;

    // Menambahkan kartu baru ke daftar dan mereset form
    productListContainer.appendChild(newCard);
    createProductForm.reset();
    closeModal();
  });


  // 2. Form Penambahan Stok
  addStockForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const productId = stockProductIdInput.value;
    const quantity = parseInt(document.getElementById('stockQuantity').value, 10);

    // --- ATURAN VALIDASI untuk Kuantitas Stok ---
    if (quantity < 1 || quantity > 9999) {
        alert("Error: Kuantitas stok yang ditambahkan harus antara 1 dan 9,999.");
        return; // Hentikan fungsi
    }

    console.log(`Menambahkan ${quantity} stok ke produk ID: ${productId}`);

    // Menemukan kartu produk yang benar untuk diperbarui
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
