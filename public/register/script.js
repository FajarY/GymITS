import { userRegister } from "../requestScript.js";

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // get user data
    const fullName = document.getElementById('fullname').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('registering user:', fullName);
    console.log('gender', gender);
    console.log('email', email);
    console.log('password', password);

    try {
        const [rest, data] = await userRegister(
            fullName,
            gender,
            email,
            password
        );

        if (rest.status === 201) {
            alert('Registration successful! Please login.');
            window.location.href = '/login';
        }
        else {
            alert('Registration failed: ' + data.error);
            console.error('Error details:', data);
        }
    }

    catch(error) {
        console.log('registration failed!', error);
    }

});