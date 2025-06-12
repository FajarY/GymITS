import { loginEmployee } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm")

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const employeeID = document.getElementById("employee-id").value;
        const password = document.getElementById("password").value;

        try {
            const [res, data] = await loginEmployee(employeeID, password);

            if (res.ok) {
                window.location.href = "/dashboard/employee";
            }
            else {
                alert(`Login Failed: ${data.message || "Invalid credentials"}`);
            }
        }
        catch (error) {
            console.error("Error during login:", error);
            alert("Error!");
        }
    });
});