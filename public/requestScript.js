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

    return undefined;
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

async function getTotalSpending() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/customer/total-spending", req);
}

async function loginEmployee(employee_id, password) {
    const req = {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            "id": employee_id,
            "password" : password
        })
    };

    return await tryFetchJson("/employee/login", req);
}

async function getEmployeeProfile() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/employee/profile", req);
}

async function postNewProduct(name, price) {
    const req = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, price })
    };

    return await tryFetchJson("/product", req);
}

async function postAddStockProduct(productId, amount) {
    const req = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount })
    };
    return await tryFetchJson(`/product/${productId}`, req);
}

async function getProductContributionStock(productId) {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };
    return await tryFetchJson(`/product/${productId}/employee/summary`, req);
}

async function getMembershipEfficiency() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/customer/efficiencyAllMemberships", req);
}

async function getMembershipSummary() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/membership/information", req);
}

async function getProductSummary() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/product/summary/data", req);
}

async function getProductDiscountOutput() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/product/productsDiscountsTotal", req);
}

async function getAllPeopleOnDatabase() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/employee/getAllPeopleOnDatabase", req);
}

async function getRevenueOnDay(date, gender) {
    const req = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "date": date,
            "gender": gender
        })
    };

    return await tryFetchJson("/receipt/revenueOnDay", req);
}

async function getTrainerLog() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/personaltrainer/log", req);
}

async function getEfficiencyOfTrainerAvailableTimes() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/personaltrainer/efficiencyAllPTAvailableTimes", req);
}

async function loginTrainer(trainer_id, password) {
    const req = {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            "id": trainer_id,
            "password" : password
        })
    };

    return await tryFetchJson("/personaltrainer/login", req);
}

async function getTrainerProfile() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/personaltrainer/profile", req);
}

async function getAllTrainers(filter) {
    const base_url = "/personaltrainer/data";
    const url = new URL(base_url, window.location.origin);
    
    if (filter === undefined) {
        filter = null;
    }
    else if (filter !== null) {
        url.searchParams.append("filter", filter);
    }
    
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson(url, req);
}

async function getCustomerAppointment() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/customer/appointments", req);
}

async function getCustomerCountOnGym() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/customer/countOnGym", req);
}

async function getAllProduct() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/product/data", req);
}

async function purchaseProducts(productsCart) {
    const req = {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(productsCart)
    }

    return await tryFetchJson("/product/purchase", req);
}

async function getBoughtProducts() {
   const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };
    return await tryFetchJson("/product/bought", req);
}

async function getReceiptHistory() {
    const req = {
        method: "GET",
        headers: {
            "Content-Type" : "application/json"
        },
    };

    return await tryFetchJson("/receipt/history", req);
}



export{
    tryFetchJson,

    userLogin,
    userRegister,
    getUserProfile,
    getTotalSpending,

    loginEmployee,
    getEmployeeProfile,
    postNewProduct,
    postAddStockProduct,
    getProductContributionStock,
    getMembershipEfficiency,
    getMembershipSummary,
    getProductSummary,
    getProductDiscountOutput,
    getAllPeopleOnDatabase,
    getRevenueOnDay,
    getTrainerLog,
    getEfficiencyOfTrainerAvailableTimes,

    loginTrainer,
    getTrainerProfile,
    getAllTrainers,


    getCustomerAppointment,
    getCustomerCountOnGym,

    getAllProduct,
    purchaseProducts,
    getBoughtProducts,

    getReceiptHistory,
}