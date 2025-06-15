import { getCustomerCountOnGym } from "../../requestScript.js";

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