import { getMembershipEfficiency } from "../../requestScript.js";

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
  const listContainer = document.getElementById("efficiency-list");
  const loadingMessage = document.getElementById("loading-message");

  function getColorForPercentage(percentage) {
    if (percentage > 75) {
      return { text: "text-green-600", bg: "bg-green-600" };
    }
    if (percentage > 30) {
      return { text: "text-yellow-500", bg: "bg-yellow-500" };
    }
    if (percentage > 0) {
      return { text: "text-red-600", bg: "bg-red-600" };
    }
    return { text: "text-gray-500", bg: "bg-gray-500" };
  }

  function renderEfficiencyList(efficiencyData) {
    listContainer.innerHTML = "";

    if (!efficiencyData || efficiencyData.length === 0) {
        listContainer.innerHTML = '<li class="p-6 text-center text-gray-500">No data available.</li>';
        return;
    }

    efficiencyData.forEach(item => {
        const percentage = parseFloat(item.percentage);
        const formattedPercentage = percentage.toFixed(1) + "%";
        const colors = getColorForPercentage(percentage);

        const listItem = document.createElement("li");
        listItem.className = "p-6";
        listItem.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-lg font-medium text-gray-800">${item.c_name}</span>
                <span class="font-bold text-lg ${colors.text}">${formattedPercentage}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div class="${colors.bg} h-2.5 rounded-full" style="width: ${percentage}%"></div>
            </div>
        `;
        listContainer.appendChild(listItem);
    });
  }

  try {
    const [response, data] = await getMembershipEfficiency();

    if (response.ok && data.status) {
      const sortedData = data.data.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
      renderEfficiencyList(sortedData);
    } else {
      loadingMessage.textContent = `Failed to load data: ${data.message || 'Unknown error'}`;
      loadingMessage.style.color = 'red';
    }
  } catch (error) {
    console.error("Error fetching membership efficiency:", error);
    loadingMessage.textContent = "An error occurred while fetching data.";
    loadingMessage.style.color = 'red';
  }
});
