document.addEventListener('DOMContentLoaded', () => {
    const datePicker = document.getElementById('date-picker');
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const totalRevenueEl = document.getElementById('total-revenue');
    const reportTitleEl = document.getElementById('report-title');

    // Mengatur tanggal default ke hari ini
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;

    /**
     * Mengambil dan menampilkan data pendapatan berdasarkan filter.
     * @param {string} onDate - Tanggal dalam format YYYY-MM-DD.
     * @param {string} onGender - Gender ('M' atau 'F').
     */
    async function fetchIncomeData(onDate, onGender) {
        const formattedDate = new Date(onDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const genderText = onGender === 'M' ? 'Pria' : 'Wanita';

        reportTitleEl.textContent = `Total Pendapatan (${genderText}) pada ${formattedDate}`;
        totalRevenueEl.textContent = 'Memuat...';

        console.log(`Memanggil fungsi REVENUE_ON_AND_GENDER untuk tanggal: ${onDate} dan gender: ${onGender}`);

        // --- SIMULASI PEMANGGILAN BACKEND ---
        // Ganti ini dengan logika fetch API yang sesungguhnya ke backend Anda.
        // Backend akan memanggil function PostgreSQL yang telah dibuat.
        const mockRevenue = Math.random() * 7500000;
        // --- AKHIR SIMULASI ---
        
        setTimeout(() => { // Simulasi jeda jaringan
            const formatAsIDR = (value) => new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(value);

            totalRevenueEl.textContent = formatAsIDR(mockRevenue);
        }, 500);
    }

    // Fungsi untuk memicu pembaruan data
    function updateReport() {
        const selectedDate = datePicker.value;
        const selectedGender = document.querySelector('input[name="gender"]:checked').value;
        if (selectedDate && selectedGender) {
            fetchIncomeData(selectedDate, selectedGender);
        }
    }

    // Event listener untuk semua filter
    datePicker.addEventListener('change', updateReport);
    genderRadios.forEach(radio => {
        radio.addEventListener('change', updateReport);
    });

    // Panggil fungsi sekali saat halaman dimuat untuk menampilkan data awal
    updateReport();
});