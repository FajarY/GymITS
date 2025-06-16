import { getTrainerLog } from "../../requestScript.js";

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
    const tableBody = document.getElementById("log-tbody");
    const loadingRow = document.getElementById("loading-row");

    /**
     * Memformat timestamp dari ISO 8601 menjadi format YYYY-MM-DD HH:MM:SS yang lebih mudah dibaca.
     * @param {string} isoString - Timestamp dalam format ISO.
     * @returns {string} Timestamp yang telah diformat.
     */
    function formatTimestamp(isoString) {
        if (!isoString) return 'N/A';
        // Membuat objek Date dan menyesuaikannya agar tidak terpengaruh timezone lokal browser
        const date = new Date(isoString);
        // Menggunakan toLocaleString dengan locale 'sv-SE' (Swedia) adalah trik untuk mendapatkan format YYYY-MM-DD HH:MM:SS
        return date.toLocaleString('sv-SE');
    }

    /**
     * Merender data log ke dalam tabel.
     * @param {object[]} logData - Array objek data log.
     */
    function renderLogTable(logData) {
        tableBody.innerHTML = ""; // Hapus pesan "loading"

        if (!logData || logData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-500">Tidak ada data log yang ditemukan.</td></tr>`;
            return;
        }

        logData.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-medium text-gray-800">${log.log_id}</td>
                <td class="p-4 font-mono text-sm text-gray-500">${log.pt_id}</td>
                <td class="p-4 font-mono text-sm text-gray-500">${log.added_by}</td>
                <td class="p-4 text-gray-600">${formatTimestamp(log.log_time)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- INISIALISASI HALAMAN ---
    try {
        const [response, data] = await getTrainerLog();

        if (response.ok && data.status) {
            // Urutkan data berdasarkan log_id terbaru (paling besar) di atas
            const sortedData = data.data.sort((a, b) => b.log_id - a.log_id);
            renderLogTable(sortedData);
        } else {
            loadingRow.innerHTML = `<td colspan="4" class="p-8 text-center text-red-500">Gagal memuat data: ${data.message || 'Error tidak diketahui'}</td>`;
        }
    } catch (error) {
        console.error("Error fetching trainer log:", error);
        loadingRow.innerHTML = `<td colspan="4" class="p-8 text-center text-red-500">Terjadi kesalahan saat mengambil data.</td>`;
    }
});
