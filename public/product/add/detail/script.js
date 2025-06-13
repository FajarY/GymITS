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
     * Mengambil data kontribusi dari backend (simulasi).
     * @param {string} productId - ID produk.
     * @returns {Promise<object[]>} Data kontribusi karyawan.
     */
    async function fetchContributionData(productId) {
        console.log(`Memanggil fungsi PERCENTAGE_ADD_ON_PRODUCT_BY_EMPLOYEE untuk produk: ${productId}`);
        // --- SIMULASI PEMANGGILAN BACKEND ---
        // Di dunia nyata, Anda akan melakukan fetch ke API backend Anda.
        // Data mock ini meniru output dari fungsi PostgreSQL Anda.
        const mockData = [
            { added_by_e_id: 'E001', add_percentage: 65.50 },
            { added_by_e_id: 'E003', add_percentage: 25.00 },
            { added_by_e_id: 'E002', add_percentage: 9.50 },
            { added_by_e_id: 'E004', add_percentage: 0.00 },
        ];
        return new Promise(resolve => setTimeout(() => resolve(mockData), 700));
        // --- AKHIR SIMULASI ---
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
        
        // Anda mungkin juga ingin mengambil nama produk untuk ditampilkan di judul
        productNameTitle.textContent = `Detail Kontribusi Stok (ID: ${productId})`;

        try {
            const contributionData = await fetchContributionData(productId);
            renderTable(contributionData);
        } catch (error) {
            console.error('Gagal mengambil data kontribusi:', error);
            loader.textContent = 'Gagal memuat data. Silakan coba lagi.';
        }
    }

    initializePage();
});
