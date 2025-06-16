import { getAllPeopleOnDatabase } from "../../requestScript.js";
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
    const tableBody = document.getElementById("people-tbody");
    const loadingRow = document.getElementById("loading-row");

    /**
     * Mengubah format gender dari ('M'/'F') menjadi ('Male'/'Female').
     * @param {string} genderChar - Karakter gender ('M' atau 'F').
     * @returns {string} String gender yang telah diformat.
     */
    function formatGender(genderChar) {
        if (genderChar === 'M') return 'Male';
        if (genderChar === 'F') return 'Female';
        return 'N/A';
    }
    
    /**
     * Memberi warna pada role untuk membedakannya.
     * @param {string} role - String role dari database.
     * @returns {string} Kelas warna Tailwind CSS.
     */
     function getRoleClass(role) {
        if (role.includes('Customer')) return 'bg-blue-100 text-blue-800';
        if (role.includes('Personal Trainer')) return 'bg-green-100 text-green-800';
        if (role.includes('Employee')) return 'bg-amber-100 text-amber-800';
        return 'bg-gray-100 text-gray-800';
    }


    /**
     * Merender daftar orang ke dalam tabel.
     * @param {object[]} peopleData - Array data orang dari backend.
     */
    function renderPeopleTable(peopleData) {
        tableBody.innerHTML = ""; // Hapus pesan "loading"

        if (!peopleData || peopleData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-gray-500">Tidak ada data yang ditemukan.</td></tr>`;
            return;
        }

        peopleData.forEach(person => {
            const roleClass = getRoleClass(person.role);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="p-4 font-medium text-gray-800">${person.name}</td>
                <td class="p-4 text-gray-600">${formatGender(person.gender)}</td>
                <td class="p-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${roleClass}">
                        ${person.role}
                    </span>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // --- INISIALISASI HALAMAN ---
    try {
        const [response, data] = await getAllPeopleOnDatabase();

        if (response.ok && data.status) {
            renderPeopleTable(data.data);
        } else {
            loadingRow.innerHTML = `<td colspan="3" class="p-8 text-center text-red-500">Gagal memuat data: ${data.message || 'Error tidak diketahui'}</td>`;
        }
    } catch (error) {
        console.error("Error fetching people data:", error);
        loadingRow.innerHTML = `<td colspan="3" class="p-8 text-center text-red-500">Terjadi kesalahan saat mengambil data.</td>`;
    }
});