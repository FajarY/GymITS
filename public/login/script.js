import { userLogin } from "../requestScript";

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // get user data
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const result = userLogin(email, password);
        console.log('login success!')
    }
    catch(error) {
        console.log('login failed!', error);
    }
});

