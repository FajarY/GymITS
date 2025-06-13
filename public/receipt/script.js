document.addEventListener('DOMContentLoaded', () => {

    const totalSpendingEl = document.getElementById('total-spending-amount');

    /**
     * Mengambil total pengeluaran dari backend (simulasi).
     * @returns {Promise<number>} Total pengeluaran.
     */
    async function fetchTotalSpending() {
        console.log("Memanggil fungsi get_total_spending(customer_id) dari backend...");
        
        // --- SIMULASI PEMANGGILAN BACKEND ---
        // Di aplikasi nyata, Anda akan melakukan fetch ke API yang memanggil fungsi PostgreSQL Anda.
        const mockTotalSpending = 12550000.50;
        return new Promise(resolve => setTimeout(() => resolve(mockTotalSpending), 800));
        // --- AKHIR SIMULASI ---
    }

    /**
     * Memformat angka sebagai mata uang Rupiah.
     * @param {number} value - Angka yang akan diformat.
     * @returns {string} String mata uang yang telah diformat.
     */
    function formatAsIDR(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    }

    /**
     * Fungsi utama untuk menginisialisasi halaman.
     */
    async function initializePage() {
        try {
            const totalSpending = await fetchTotalSpending();
            totalSpendingEl.textContent = formatAsIDR(totalSpending);
        } catch (error) {
            console.error("Gagal mengambil total pengeluaran:", error);
            totalSpendingEl.textContent = "Error";
            totalSpendingEl.style.color = 'red';
        }
    }

    initializePage();
});
