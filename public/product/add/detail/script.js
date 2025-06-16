import { getProductContributionStock } from "../../../requestScript.js";
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

document.addEventListener('DOMContentLoaded', () => {

    const productNameTitle = document.getElementById('product-name-title');
    const contributionTbody = document.getElementById('contribution-tbody');
    const loader = document.getElementById('loader');
    const tableContainer = document.getElementById('contribution-table-container');

    /**
     * Mengambil ID produk dari URL.
     * @returns {string|null} ID produk atau null.
     */
    function getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    /**
     * Merender data ke dalam tabel.
     * @param {object[]} data - Array objek kontribusi.
     */
    function renderTable(data) {
        contributionTbody.innerHTML = ''; // Kosongkan tabel sebelum diisi

        if (!data || data.length === 0) {
            loader.textContent = 'Tidak ada data kontribusi untuk produk ini.';
            return;
        }

        data.forEach(item => {
            const percentage = parseFloat(item.add_percentage).toFixed(2);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-mono text-gray-700">${item.added_by_e_id}</td>
                <td class="p-4 font-bold text-gray-800 text-right">${percentage}%</td>
            `;
            contributionTbody.appendChild(row);
        });

        loader.classList.add('hidden');
        tableContainer.classList.remove('hidden');
    }

    /**
     * Fungsi utama untuk menginisialisasi halaman.
     */
    async function initializePage() {
        const productId = getProductIdFromURL();

        if (!productId) {
            loader.textContent = 'Error: ID Produk tidak ditemukan di URL.';
            return;
        }
        
        productNameTitle.textContent = `Detail Kontribusi Stok (ID: ${productId})`;

        try {
            // Panggil fungsi dari requestScript.js dengan productId
            const [response, data] = await getProductContributionStock(productId);

            if (response.ok && data.status) {
                 renderTable(data.data);
            } else {
                 loader.textContent = `Gagal memuat data: ${data ? data.message : 'Error tidak diketahui'}`;
                 loader.style.color = 'red';
            }
        } catch (error) {
            console.error('Gagal mengambil data kontribusi:', error);
            loader.textContent = 'Gagal memuat data. Silakan coba lagi.';
        }
    }

    initializePage();
});
