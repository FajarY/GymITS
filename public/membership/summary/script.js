import { getMembershipSummary } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("membership-tbody");
    const loadingRow = document.getElementById("loading-row");

    /**
     * Memformat tanggal dari format ISO (yyyy-mm-ddT...) menjadi yyyy-mm-dd.
     * @param {string} dateString - String tanggal ISO.
     * @returns {string} Tanggal yang diformat.
     */
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return dateString.split('T')[0];
    }

    /**
     * Merender data summary membership ke dalam tabel.
     * @param {object[]} summaryData - Array objek data membership.
     */
    function renderSummaryTable(summaryData) {
        tableBody.innerHTML = ""; // Hapus pesan "loading"

        if (!summaryData || summaryData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-500">Tidak ada data membership yang ditemukan.</td></tr>`;
            return;
        }

        summaryData.forEach(item => {
            const statusClass = item.status === 'active' 
                ? 'text-green-800 bg-green-200' 
                : 'text-red-800 bg-red-200';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-mono text-sm text-gray-500">${item.m_id}</td>
                <td class="p-4 font-medium text-gray-800">${item.c_name}</td>
                <td class="p-4 text-gray-600">${item.m_telephone}</td>
                <td class="p-4 text-gray-600">${formatDate(item.m_start_date)}</td>
                <td class="p-4 text-gray-600">${formatDate(item.m_expired_date)}</td>
                <td class="p-4 text-gray-600">${item.mt_name}</td>
                <td class="p-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">${item.status}</span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- INISIALISASI HALAMAN ---
    try {
        const [response, data] = await getMembershipSummary();

        if (response.ok && data.status) {
            renderSummaryTable(data.data);
        } else {
            loadingRow.innerHTML = `<td colspan="7" class="p-8 text-center text-red-500">Gagal memuat data: ${data.message || 'Error tidak diketahui'}</td>`;
        }
    } catch (error) {
        console.error("Error fetching membership summary:", error);
        loadingRow.innerHTML = `<td colspan="7" class="p-8 text-center text-red-500">Terjadi kesalahan saat mengambil data.</td>`;
    }
});
