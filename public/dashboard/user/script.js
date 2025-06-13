import { tryFetchJson } from "../../requestScript.js";

const countGymP = document.getElementById('live-gym-status');

async function getCountOnGym()
{
    const req = {
        method: "GET"
    };
    
    return await tryFetchJson("/customer/countOnGym", req)
}

async function initialize()
{
    try
    {
        const data = await getCountOnGym();

        countGymP.textContent = data[1].data.count;
    }
    catch(error)
    {
        alert(error);
    }
}

initialize();