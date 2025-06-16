import { getCustomerAppointment } from "../../requestScript.js";

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

if (parseJwt(getCookie("token")) == null || parseJwt(getCookie("token")).role != 'customer') {
    window.location.href = '/login/'
}

document.addEventListener("DOMContentLoaded", async () => {
  const appointmentsContainer = document.querySelector(".space-y-6");

  const getPlaceholderImage = (name) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    const color = "3490F3";
    return `https://placehold.co/64x64/${color}/FFFFFF?text=${initials}`;
  };

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return {
          classes: "bg-blue-100 text-blue-800",
          opacityClass: "",
        };
      case "completed":
        return {
          classes: "bg-gray-200 text-gray-800",
          opacityClass: "opacity-70",
        };
      default:
        return {
          classes: "bg-yellow-100 text-yellow-800",
          opacityClass: "opacity-80",
        };
    }
  };

  try {
    const [res, data] = await getCustomerAppointment();

    console.log("Response:", res);
    console.log("Data:", data);

    if (res.ok) {
      const appointmentList = data.data;

      appointmentsContainer.innerHTML = "";

      if (appointmentList && appointmentList.length > 0) {
        appointmentList.forEach((appointment) => {
          const appointmentElement = document.createElement("div");
          const statusInfo = getStatusInfo(appointment.status);

          appointmentElement.className = `bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center gap-6 ${statusInfo.opacityClass}`;

          appointmentElement.innerHTML = `
            <div class="flex items-center gap-4 flex-shrink-0">
                <img
                    src="${getPlaceholderImage(appointment.pt_name)}"
                    alt="${appointment.pt_name}"
                    class="w-16 h-16 rounded-full"
                />
                <div>
                    <h3 class="font-bold text-lg text-[#0d141c]">${
                      appointment.pt_name
                    }</h3>
                </div>
            </div>
            <div class="flex-grow text-gray-700 space-y-2 md:space-y-0 md:flex md:items-center md:gap-8">
                <div>
                    <p class="text-sm font-bold">Date</p>
                    <p>${appointment.appointment_date}</p>
                </div>
                <div>
                    <p class="text-sm font-bold">Time</p>
                    <p>${appointment.appointment_time}</p>
                </div>
            </div>
            <div class="flex-shrink-0 w-full md:w-auto flex flex-col items-start md:items-end gap-3">
                <span class="text-xs font-bold ${
                  statusInfo.classes
                } px-3 py-1 rounded-full">
                    ${appointment.status.toUpperCase()}
                </span>
            </div>
          `;

          appointmentsContainer.appendChild(appointmentElement);
        });
      } else {
        appointmentsContainer.innerHTML =
          '<p class="text-center text-gray-500">No appointments found.</p>';
      }
    }
  } catch (error) {
    console.error("Error fetching appointment list:", error);
    alert("Error fetching appointment list: " + error.message);
  }
});
