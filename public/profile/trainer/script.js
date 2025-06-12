import { getTrainerProfile } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [res, data] = await getTrainerProfile();

        if (res.ok) {
            const trainerProfile = data.data;

            document.getElementById("trainer-name").textContent = trainerProfile.name;
            document.getElementById("trainer-gender").textContent = trainerProfile.gender;
            document.getElementById("trainer-telephone").textContent = trainerProfile.telephone;
            document.getElementById("trainer-address").textContent = trainerProfile.alamat;
            document.getElementById("trainer-price").textContent = trainerProfile.price_per_hour;
        }
    } 
    catch (error) {
        console.error("Error fetching trainer profile:", error);
        alert("Error fetching trainer profile: " + error.message);
    }
    
});