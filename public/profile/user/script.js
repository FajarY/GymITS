import { getUserProfile } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [rest, data] = await getUserProfile();

        console.log("Response:", rest);
        console.log("Data:", data);

        if (rest.status === 200)  {
            const userProfile = data.data;

            document.getElementById("user-fullname").textContent = userProfile.name;
            document.getElementById("user-email").textContent = userProfile.email;
            document.getElementById("user-gender").textContent = userProfile.gender;


            document.getElementById("user-membership-type").textContent = userProfile.membership_type;
            document.getElementById("membership-address").textContent = userProfile.alamat;
            document.getElementById("user-telephone").textContent = userProfile.telephone;
            
            const startDate = new Date(userProfile.start_date);
            const expiredtDate = new Date(userProfile.expired_date);

            const formatedStartDate = startDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            const formatedExpiredDate = expiredtDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            console.log("Start Date:", formatedStartDate);
            console.log("Expired Date:", formatedExpiredDate);

            document.getElementById("membership-start-date").textContent = formatedStartDate;
            document.getElementById("membership-expired-date").textContent = formatedExpiredDate;
        }
        else {
            alert("Failed to fetch user profile: " + rest.statusText);
            return;
        }
    }
    catch (error) {
        alert("Error fetching user profile: " + error.message);
    }
});