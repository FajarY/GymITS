import { getUserProfile } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", async () => {
    const loader = document.getElementById("loader");
    const mainContent = document.getElementById("main-content");
    
    try {
        const [res, data] = await getUserProfile();

        if (res.ok && data.status) {
            const userProfile = data.data;

            // --- Isi Detail Akun ---
            document.getElementById("user-fullname").textContent = userProfile.name;
            document.getElementById("user-email").textContent = userProfile.email;
            document.getElementById("user-gender").textContent = userProfile.gender === 'M' ? 'Male' : 'Female';

            // --- Periksa dan Tampilkan Info Membership ---
            const membershipDetailsCard = document.getElementById("membership-details");
            const noMembershipCard = document.getElementById("no-membership");

            // Cek jika data membership ada dan tidak null
            if (userProfile.membership_type) {
                // Tampilkan kartu detail membership
                membershipDetailsCard.classList.remove("hidden");
                noMembershipCard.classList.add("hidden");

                // Isi detail membership
                document.getElementById("user-membership-type").textContent = userProfile.membership_type;
                document.getElementById("membership-address").textContent = userProfile.alamat;
                document.getElementById("user-telephone").textContent = userProfile.telephone;
                
                // Format tanggal agar lebih mudah dibaca
                const formatDate = (dateString) => {
                    if (!dateString) return "N/A";
                    return new Date(dateString).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                };

                document.getElementById("membership-start-date").textContent = formatDate(userProfile.start_date);
                document.getElementById("membership-expired-date").textContent = formatDate(userProfile.expired_date);

            } else {
                // Jika tidak ada membership, tampilkan kartu yang sesuai
                membershipDetailsCard.classList.add("hidden");
                noMembershipCard.classList.remove("hidden");
            }
            
            // Tampilkan konten utama setelah data dimuat
            loader.classList.add('hidden');
            mainContent.classList.remove('hidden');

        } else {
            loader.textContent = "Gagal mengambil profil pengguna: " + (data ? data.message : res.statusText);
            loader.style.color = "red";
        }
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        loader.textContent = "Terjadi kesalahan saat mengambil profil pengguna: " + error.message;
        loader.style.color = "red";
    }
});
