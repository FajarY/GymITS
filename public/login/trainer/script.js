import { loginTrainer } from "../../requestScript.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm")

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const trainerID = document.getElementById("trainer-id").value;
        const password = document.getElementById("password").value;

        try {
            const [res, data] = await loginTrainer(trainerID, password);

            if (res.ok) {
                window.location.href = "/dashboard/trainer";
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