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
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'email': email,
            'password' : password
        })
    };

    return await tryFetchJson('/login', req)
}

export function userRegister(fullname, gender, email, password ) {
    const req = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'fullname': fullname,
            'gender' : gender,
            'email': email,
            'password': password
        })
    };

    return tryFetchJson('/customer/register', req)
}

export{
    tryFetchJson,
    userLogin,
    userRegister,
}