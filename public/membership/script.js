const membershipForm = document.getElementById('membershipForm');
const formMessage = document.getElementById('form-message');
import { tryFetchJson } from "../requestScript.js";

const  getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return value;
  }
  return null;
}

const parseJwt = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

if (parseJwt(getCookie("token")) == null || parseJwt(getCookie("token")).role != 'customer') {
    window.location.href = '/login/'
}


const planInput = document.getElementById('membership-plan');
const phoneInput = document.getElementById('telephone-number');
const addressInput = document.getElementById('address');
const monthInput = document.getElementById('month-amount');

async function getMembershipList()
{
    const req = {
        method: "GET"
    };

    try
    {
        const res = await tryFetchJson('/membership/typeList', req);

        return res[1].data;
    }
    catch(error)
    {
        alert(error);
    }

    return undefined;
}

async function initialize()
{
    const types = await getMembershipList();

    if(!types)
    {
        return;
    }

    planInput.innerHTML = '<option value="" disabled selected>Select a plan...</option>';
    for(var i = 0; i < types.length; i++)
    {
        planInput.innerHTML += `<option value="${types[i].id}">${types[i].name} - Rp.${types[i].price_per_month}/bulan</option>`
    }
}

initialize();

membershipForm.addEventListener('submit', async (event) =>
{
    // Prevent the form from submitting the default way
    event.preventDefault();

    // --- Get form values ---
    const plan = planInput.value;
    const phone = phoneInput.value;
    const address = addressInput.value;
    const months = parseInt(monthInput.value, 10);

    // --- VALIDATION LOGIC ---
    if (!plan)
    {
        alert('Error: Please select a membership plan.');
        return;
    }

    if (!/^\d*$/.test(phone) || phone.length > 16)
    {
        alert('Error: Telephone must contain only numbers and be 16 digits or less.');
        return;
    }

    if (address.length > 256)
    {
        alert('Error: Address must be 256 characters or less.');
        return;
    }

    if (isNaN(months) || months < 1 || months > 60)
    {
        alert('Error: Month amount must be a number between 1 and 60.');
        return;
    }

    // If all validation passes, proceed
    formMessage.textContent = 'Processing your request...';
    formMessage.style.color = 'blue';

    // --- SIMULATE POST TO BACKEND ---
    const req = {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            "telephone": phone,
            "alamat" : address,
            "membership_type_id": plan,
            "month_amount": months
        })
    };

    try
    {
        const responseData = await tryFetchJson('/membership/purchase', req);

        if(!responseData[1].status)
        {
            formMessage.textContent = 'Activation failed, try again';
            formMessage.style.color = 'red';
            alert(`Failed when purchasing membership, ${responseData[1].error}`);
            return;
        }

        formMessage.textContent = 'Activation successful! Redirecting...';
        formMessage.style.color = 'green';

        setTimeout(() =>
        {
            window.location.href = '/dashboard/user';
        }, 1500);
    }
    catch(error)
    {
        alert(error);
    }
});