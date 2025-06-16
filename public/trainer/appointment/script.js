import { tryFetchJson } from "../../requestScript.js";

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

if (parseJwt(getCookie("token")) == null || parseJwt(getCookie("token")).role != 'trainer') {
    window.location.href = '/login/trainer'
}


document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('list-container');

    const appointments = async () => {
        const req = {
            method: "GET",
        }
        return await tryFetchJson("/personaltrainer/appointments", req);
    }

    const loadData = async () => {
        const [_, res] = await appointments();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const datas = res.data;
        for(const data of datas) {
            const newDate = new Date(data.at_date); 
            const template = `
            <div class="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center gap-6 opacity-70">
                <div class="flex items-center gap-4 flex-shrink-0">
                    <img 
                        src="https://placehold.co/64x64/3490F3/FFFFFF?text=JD" 
                        alt="${data.booked_by_customer}" 
                        class="w-16 h-16 rounded-full"
                    >
                    <div>
                        <h3 class="font-bold text-lg text-[#0d141c]">${data.booked_by_customer}</h3>
                    </div>
                </div>
                    <div class="flex-grow text-gray-700 space-y-2 md:space-y-0 md:flex md:items-center md:gap-8">
                    <div>
                        <p class="text-sm font-bold">Date</p>
                        <p>${monthNames[newDate.getMonth()]} ${newDate.getDay()}, ${newDate.getFullYear()}</p>
                    </div>
                    <div>
                        <p class="text-sm font-bold">Time</p>
                        <p>${data.at_start_time} - ${data.at_end_time}</p>
                    </div>
                </div>
                <div class="flex-shrink-0 w-full md:w-auto flex flex-col items-start md:items-end gap-3">
                        <span class="text-xs font-bold bg-gray-200 text-gray-800 px-3 py-1 rounded-full">${data.appointment_status}</span>
                </div>
            </div>
            `
            listContainer.innerHTML += template;
        }
    }

    loadData();
})