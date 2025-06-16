import { getRevenueOnDay } from "../../requestScript.js";

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
        const formattedDate = new Date(onDate + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const genderText = onGender === 'M' ? 'Pria' : 'Wanita';

        reportTitleEl.textContent = `Total Pendapatan (${genderText}) pada ${formattedDate}`;
        totalRevenueEl.textContent = 'Memuat...';

        try {
            const [response, data] = await getRevenueOnDay(onDate, onGender);
            
            if (response.ok && data.status) {
                const revenue = data.data.revenue_on_and_gender;
                const formatAsIDR = (value) => new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                }).format(parseFloat(value) || 0);
                
                totalRevenueEl.textContent = formatAsIDR(revenue);
            } else {
                totalRevenueEl.textContent = "Gagal memuat";
                console.error("Gagal mengambil data:", data.message);
            }
        } catch (error) {
            totalRevenueEl.textContent = "Error";
            console.error("Terjadi kesalahan saat fetch:", error);
        }
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
