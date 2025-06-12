import * as utils from './requestUtils.js';

async function tryFetchJson(url, req)
{
    try
    {
        const res = await fetch(url, req);
        const data = await res.json();

        return [res, data];
    }
    catch(err)
    {
        console.error(err);
    }
}

async function userLogin(email, password) {
    const req = {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            "email": email,
            "password" : password
        })
    };

    return await tryFetchJson("/customer/login", req)
}

async function userRegister(name, gender, email, password) {
    const req = {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            "name": name,
            "gender" : gender,
            "email": email,
            "password": password
        })
    };

    return await tryFetchJson("/customer/register", req);
}

async function getUserProfile() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"

        },
    };

    return await tryFetchJson("/customer/profile", req);
}

export{
    tryFetchJson,
    userLogin,
    userRegister,
    getUserProfile,
}