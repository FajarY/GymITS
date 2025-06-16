import { getProductDiscountOutput } from "../../requestScript.js";

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
    const tableBody = document.getElementById("discount-tbody");
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
     * Merender data ringkasan diskon produk ke dalam tabel.
     * @param {object[]} discountData - Array objek data diskon.
     */
    function renderDiscountTable(discountData) {
        tableBody.innerHTML = ""; // Hapus pesan "loading"

        if (!discountData || discountData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-gray-500">Tidak ada data diskon yang ditemukan.</td></tr>`;
            return;
        }

        // Urutkan data berdasarkan total diskon dari yang terbesar
        const sortedData = discountData.sort((a, b) => parseFloat(b.total_discount_output) - parseFloat(a.total_discount_output));

        sortedData.forEach(item => {
            const totalDiscount = parseFloat(item.total_discount_output);
            const percentage = parseFloat(item.discount_percent_from_total).toFixed(2) + "%";
            
            // Beri warna merah jika ada diskon, hijau jika tidak ada
            const discountColor = totalDiscount > 0 ? 'text-red-600' : 'text-green-600';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-medium text-gray-800">${item.p_name}</td>
                <td class="p-4 text-right font-medium ${discountColor}">${formatAsIDR(totalDiscount)}</td>
                <td class="p-4 text-right">${percentage}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- INISIALISASI HALAMAN ---
    try {
        const [response, data] = await getProductDiscountOutput();

        if (response.ok && data.status) {
            renderDiscountTable(data.data);
        } else {
            loadingRow.innerHTML = `<td colspan="3" class="p-8 text-center text-red-500">Gagal memuat data: ${data.message || 'Error tidak diketahui'}</td>`;
        }
    } catch (error) {
        console.error("Error fetching product discount summary:", error);
        loadingRow.innerHTML = `<td colspan="3" class="p-8 text-center text-red-500">Terjadi kesalahan saat mengambil data.</td>`;
    }
});
