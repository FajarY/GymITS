import { userRegister } from "../requestScript";

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // get user data
    const fullName = document.getElementById('fullname').value;
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const result = await userRegister(
            fullName,
            gender,
            email,
            password
        );

        console.log('registration success!', result);
    }

    catch(error) {
        console.log('registration failed!', error);
    }

});