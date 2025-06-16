import { getCustomerCountOnGym } from "../../requestScript.js";

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
    const liveStatus = document.getElementById("live-gym-status");

    try {
        const [res, data] = await getCustomerCountOnGym();
        if (res.ok) {
            liveStatus.textContent = data.data.count;
        }
        else {
            console.error("Failed to fetch customer count:", res.statusText);
            liveStatus.textContent = "N/A";
        }
    }
    catch (error) {
        console.error("Error fetching customer count:", error);
        liveStatus.textContent = "N/A";
    }
});