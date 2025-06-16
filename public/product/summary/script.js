import { getProductSummary } from "../../requestScript.js";

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

document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("summary-tbody");
    const loadingRow = document.getElementById("loading-row");

    /**
     * Memformat angka sebagai mata uang Rupiah.
     * @param {number|string} value - Angka yang akan diformat.
     * @returns {string} String mata uang yang telah diformat.
     */
    function formatAsIDR(value) {
        const numberValue = parseFloat(value);
        if (isNaN(numberValue)) return 'N/A';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(numberValue);
    }

    /**
     * Merender data ringkasan produk ke dalam tabel.
     * @param {object[]} summaryData - Array objek data ringkasan produk.
     */
    function renderSummaryTable(summaryData) {
        tableBody.innerHTML = ""; // Hapus pesan "loading"

        if (!summaryData || summaryData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500">Tidak ada data ringkasan produk yang ditemukan.</td></tr>`;
            return;
        }

        summaryData.forEach(item => {
            const stock = parseInt(item.current_stock, 10);
            // Tambahkan kelas warna merah jika stok negatif
            const stockClass = stock < 0 ? 'text-red-600 font-bold' : 'text-gray-800';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-medium text-gray-800">${item.p_name}</td>
                <td class="p-4 text-right">${item.total_unit_sold}</td>
                <td class="p-4 text-right">${formatAsIDR(item.total_revenue)}</td>
                <td class="p-4 text-right ${stockClass}">${item.current_stock}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- INISIALISASI HALAMAN ---
    try {
        const [response, data] = await getProductSummary();

        if (response.ok && data.status) {
            renderSummaryTable(data.data);
        } else {
            loadingRow.innerHTML = `<td colspan="4" class="p-8 text-center text-red-500">Gagal memuat data: ${data.message || 'Error tidak diketahui'}</td>`;
        }
    } catch (error) {
        console.error("Error fetching product summary:", error);
        loadingRow.innerHTML = `<td colspan="4" class="p-8 text-center text-red-500">Terjadi kesalahan saat mengambil data.</td>`;
    }
});
