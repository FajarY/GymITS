import { getEmployeeProfile } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [res, data] = await getEmployeeProfile();

        console.log("Response:", res);
        console.log("Data:", data);

        if (res.ok) {
            const employeeProfile = data.data;

            console.log("Employee Profile:", employeeProfile);

            document.getElementById("employee-name").textContent = employeeProfile.name;
            document.getElementById("employee-gender").textContent = employeeProfile.gender;
            document.getElementById("employee-telephone").textContent = employeeProfile.telephone;
            document.getElementById("employee-address").textContent = employeeProfile.alamat;
        }
    } 
    catch (error) {
        console.error("Error fetching employee profile:", error);
        alert("Error fetching employee profile: " + error.message);
    }
    
});