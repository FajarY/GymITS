import { userLogin } from "../requestScript.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const [res, data] = await userLogin(email, password);

        // console.log("Response:", res);
        // console.log("Data:", data);

        if (res && res.ok) {
          console.log("Login successful:", data);
        //   alert("Login Successful!");
          window.location.href = "/dashboard/user";
        } else {
          console.error("Login failed:", data);
          alert(`Login Failed: ${data.message || "Invalid credentials"}`);
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("Error!");
      }
    });
  }
});
