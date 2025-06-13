import { getTrainerProfile } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Panggil fungsi untuk mendapatkan data profil dari backend
        const [res, data] = await getTrainerProfile();

        // Periksa apakah request berhasil
        if (res.ok) {
            const trainerProfile = data.data;

            // Fungsi untuk memformat angka menjadi mata uang Rupiah
            const formatAsIDR = (value) => new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(value);

            // Mengisi elemen-elemen di halaman dengan data yang diterima
            document.getElementById("trainer-name").textContent = trainerProfile.name;
            document.getElementById("trainer-gender").textContent = trainerProfile.gender;
            document.getElementById("trainer-telephone").textContent = trainerProfile.telephone;
            document.getElementById("trainer-address").textContent = trainerProfile.alamat;
            
            // Format harga per jam
            document.getElementById("trainer-price").textContent = `${formatAsIDR(trainerProfile.price_per_hour)} / jam`;

            // Format dan tampilkan total pendapatan
            // Pastikan properti ini ada di data yang Anda kirim dari backend, contoh: trainerProfile.total_income
            if (trainerProfile.total_income !== undefined) {
                 document.getElementById("trainer-income").textContent = formatAsIDR(trainerProfile.total_income);
            }
           
        } else {
            // Tangani respons error dari server
            alert("Gagal mengambil profil trainer: " + data.message);
        }
    } 
    catch (error) {
        // Tangani error jaringan atau lainnya
        console.error("Error fetching trainer profile:", error);
        alert("Error fetching trainer profile: " + error.message);
    }
});
