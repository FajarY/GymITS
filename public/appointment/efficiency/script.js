import { getEfficiencyOfTrainerAvailableTimes } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", async () => {
    const listContainer = document.getElementById("efficiency-list");
    const loadingMessage = document.getElementById("loading-message");

    /**
     * Menentukan warna berdasarkan nilai persentase.
     * @param {number} percentage - Nilai persentase.
     * @returns {{text: string, bg: string}} Objek berisi kelas warna untuk teks dan background.
     */
    function getColorForPercentage(percentage) {
        if (percentage > 60) {
            return { text: "text-green-600", bg: "bg-green-600" };
        }
        if (percentage > 30) {
            return { text: "text-yellow-500", bg: "bg-yellow-500" };
        }
        return { text: "text-red-600", bg: "bg-red-600" };
    }

    /**
     * Merender daftar efisiensi ke halaman.
     * @param {object[]} efficiencyData - Array data efisiensi dari backend.
     */
    function renderEfficiencyList(efficiencyData) {
        listContainer.innerHTML = ""; // Hapus pesan "loading"

        if (!efficiencyData || efficiencyData.length === 0) {
            listContainer.innerHTML = '<li class="p-6 text-center text-gray-500">Tidak ada data efisiensi yang ditemukan.</li>';
            return;
        }

        // Urutkan data berdasarkan efisiensi dari yang tertinggi
        const sortedData = efficiencyData.sort((a, b) => parseFloat(b.efficiency) - parseFloat(a.efficiency));

        sortedData.forEach(item => {
            const percentage = parseFloat(item.efficiency);
            const formattedPercentage = percentage.toFixed(1) + "%";
            const colors = getColorForPercentage(percentage);

            const listItem = document.createElement("li");
            listItem.className = "p-6";
            listItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="text-lg font-medium text-gray-800">${item.pt_name} (${item.pt_id})</span>
                    <span class="font-bold text-lg ${colors.text}">${formattedPercentage}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div class="${colors.bg} h-2.5 rounded-full" style="width: ${percentage}%"></div>
                </div>
            `;
            listContainer.appendChild(listItem);
        });
    }

    // --- INISIALISASI HALAMAN ---
    try {
        const [response, data] = await getEfficiencyOfTrainerAvailableTimes();

        if (response.ok && data.status) {
            renderEfficiencyList(data.data);
        } else {
            loadingMessage.textContent = `Gagal memuat data: ${data.message || 'Error tidak diketahui'}`;
            loadingMessage.style.color = 'red';
        }
    } catch (error) {
        console.error("Error fetching trainer efficiency:", error);
        loadingMessage.textContent = "Terjadi kesalahan saat mengambil data.";
        loadingMessage.style.color = 'red';
    }
});
