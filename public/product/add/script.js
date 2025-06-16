import { tryFetchJson, postNewProduct, postAddStockProduct } from "../../requestScript.js"; // Pastikan postAddStockProduct diimpor
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

if (parseJwt(getCookie("token")) == null || parseJwt(getCookie("token")).role != 'employee') {
    window.location.href = '/login/employee'
}

function renderProducts(products, container) {
    container.innerHTML = ''; // Kosongkan kontainer
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">Belum ada produk.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card flex flex-col bg-white rounded-lg shadow-md overflow-hidden';
        card.dataset.productId = product.id; // Gunakan id dari data

        card.innerHTML = `
            <img src="https://placehold.co/400x300/3490f3/white?text=Gym+Product" alt="Product Image" class="w-full h-48 object-cover">
            <div class="p-6 flex-grow flex flex-col">
                <div class="flex-grow">
                    <h3 class="product-name text-xl font-bold text-[#0d141c]">${product.name}</h3>
                    <p class="product-price text-lg font-semibold text-gray-700 mt-2">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}</p>
                    <p class="text-sm text-gray-500 mt-2">Current Stock: <span class="product-stock font-bold">${product.stock}</span></p>
                </div>
                <div class="mt-6 flex flex-col sm:flex-row gap-2">
                    <button class="add-stock-btn w-full px-4 py-3 rounded-lg bg-slate-200 text-slate-800 font-medium transition hover:bg-slate-300">
                        Add Stock
                    </button>
                    <a href="/product/add/detail/?id=${product.id}" class="detail-btn w-full px-4 py-3 rounded-lg bg-indigo-500 text-white font-medium transition hover:bg-indigo-600 text-center flex items-center justify-center">
                        Detail
                    </a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadData(container, loadingMessage) {
    try {
        const [response, res] = await tryFetchJson("/product/data");
        if (response.ok && res.status) {
            // Urutkan data berdasarkan ID produk sebelum merender
            const sortedData = res.data.sort((a, b) => a.id.localeCompare(b.id));
            renderProducts(sortedData, container);
        } else {
            loadingMessage.textContent = 'Gagal memuat produk.';
            loadingMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        loadingMessage.textContent = 'Terjadi kesalahan.';
        loadingMessage.style.color = 'red';
    }
}

document.addEventListener('DOMContentLoaded', () => {
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
  const loadingMessage = document.getElementById('loading-message');

  createProductBtn.addEventListener('click', () => {
    createProductModal.classList.remove('hidden');
  });

  productListContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('add-stock-btn')) {
          const card = event.target.closest('.product-card');
          const productId = card.dataset.productId;
          const productName = card.querySelector('.product-name').textContent;
          stockProductName.textContent = productName;
          stockProductIdInput.value = productId;
          addStockModal.classList.remove('hidden');
      }
  });

  function closeModal() {
    createProductModal.classList.add('hidden');
    addStockModal.classList.add('hidden');
  }

  cancelCreateBtn.addEventListener('click', closeModal);
  cancelStockBtn.addEventListener('click', closeModal);
  createProductModal.addEventListener('click', (e) => e.target === createProductModal && closeModal());
  addStockModal.addEventListener('click', (e) => e.target === addStockModal && closeModal());

  // --- LOGIKA FORM PEMBUATAN PRODUK ---
  createProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);

    // Validasi harga
    if (price < 0 || price > 99999999) {
        alert("Error: Harga harus antara 0 dan 99,999,999.");
        return;
    }

    try {
        const [response, res] = await postNewProduct(name, price);

        if (response.ok && res.status) {
            alert('Produk berhasil ditambahkan!');
            
            // Memuat ulang seluruh daftar produk dari server
            loadData(productListContainer, loadingMessage);
            
            createProductForm.reset();
            closeModal();
        } else {
            alert(`Gagal membuat produk: ${res.message || 'Error tidak diketahui'}`);
        }
    } catch (error) {
        console.error('Error saat membuat produk:', error);
        alert('Terjadi kesalahan saat menghubungi server.');
    }
  });


  // --- LOGIKA FORM PENAMBAHAN STOK ---
  addStockForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const productId = stockProductIdInput.value;
    const quantity = parseInt(document.getElementById('stockQuantity').value, 10);

    // Validasi kuantitas
    if (quantity < 1 || quantity > 9999) {
        alert("Error: Kuantitas stok yang ditambahkan harus antara 1 dan 9,999.");
        return;
    }

    try {
        const [response, res] = await postAddStockProduct(productId, quantity);

        if (response.ok && res.status) {
            alert('Stok berhasil ditambahkan!');
            
            // Memuat ulang seluruh daftar produk dari server untuk memperbarui stok
            loadData(productListContainer, loadingMessage);
            
            addStockForm.reset();
            closeModal();
        } else {
             alert(`Gagal menambahkan stok: ${res.message || 'Error tidak diketahui'}`);
        }
    } catch (error) {
        console.error('Error saat menambahkan stok:', error);
        alert('Terjadi kesalahan saat menghubungi server.');
    }
  });

  loadData(productListContainer, loadingMessage);
});