import { tryFetchJson } from "../../requestScript.js";

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

if (parseJwt(getCookie("token")) == null || parseJwt(getCookie("token")).role != 'employee') {
    window.location.href = '/login/employee'
}

const getTrainers = async () => {
    const req = {
        method: "GET",
    }
    return await tryFetchJson("/personaltrainer/data", req);
}
const createTrainer = async (payload) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    };
    return await tryFetchJson('/personaltrainer', requestOptions);
}

const loadData = async () => {
  const container = document.getElementById('trainer-list');
  container.innerHTML = ''; 
  const [_, res] = await getTrainers();

  const datas = res.data;
  for(const data of datas) {
    const template  = `
      <div class="trainer-card flex flex-col bg-white rounded-lg shadow-md overflow-hidden" data-trainer-id="1">
        <img src="https://placehold.co/400x300/4a5568/white?text=Trainer" alt="Trainer Image" class="w-full h-48 object-cover">
        <div class="p-6 flex-grow flex flex-col">
            <h3 class="trainer-name text-xl font-bold text-[#0d141c]">${data.name}</h3>
            <p class="trainer-gender text-sm text-gray-500">${(data.gender == "F") ? "Female" : "Male"}</p>
            <p class="trainer-price text-lg font-semibold text-gray-700 mt-2">Rp ${parseInt(data.price_per_hour)} / hour</p>
            <p class="trainer-phone text-sm text-gray-500 mt-2">Tel: ${data.telephone}</p>
        </div>
      </div>

    `
    container.innerHTML += template
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // --- Get all necessary elements from the DOM ---
  const createTrainerBtn = document.getElementById('create-trainer-btn');
  const createTrainerModal = document.getElementById('create-trainer-modal');
  const createTrainerForm = document.getElementById('create-trainer-form');
  const cancelCreateBtn = document.getElementById('cancel-create-btn');
  const trainerListContainer = document.getElementById('trainer-list');

  // --- Event Listener to OPEN the modal ---
  createTrainerBtn.addEventListener('click', () => {
    createTrainerModal.classList.remove('hidden');
  });

  // --- Event Listeners to CLOSE the modal ---
  function closeModal() {
    createTrainerModal.classList.add('hidden');
  }
  cancelCreateBtn.addEventListener('click', closeModal);
  // Close modal if the user clicks on the background overlay
  createTrainerModal.addEventListener('click', (event) => {
    if (event.target === createTrainerModal) {
      closeModal();
    }
  });

  // --- Handle FORM Submission ---
  createTrainerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get all input elements from the form
    const nameInput = document.getElementById('trainerName');
    const phoneInput = document.getElementById('trainerPhone');
    const passwordInput = document.getElementById('trainerPassword');
    const genderInput = document.getElementById('trainerGender');
    const addressInput = document.getElementById('trainerAddress');
    const priceInput = document.getElementById('trainerPrice');

    // Get the values from the inputs
    const name = nameInput.value;
    const phone = phoneInput.value;
    const password = passwordInput.value;
    const gender = genderInput.value;
    const address = addressInput.value;
    const price = parseFloat(priceInput.value);

    // --- VALIDATION LOGIC ---
    if (name.length > 128) {
        alert('Error: Name must be 128 characters or less.');
        return;
    }
    if (!/^\d*$/.test(phone) || phone.length > 16) {
        alert('Error: Telephone must contain only numbers and be 16 digits or less.');
        return;
    }
    if (password.length > 32) {
        alert('Error: Password must be 32 characters or less.');
        return;
    }
    if (address.length > 256) {
        alert('Error: Address must be 256 characters or less.');
        return;
    }
    if (isNaN(price) || price < 0 || price > 99999999) {
        alert('Error: Price must be a valid number between 0 and 99999999');
        return;
    }

    const newTrainerData = {
        name: nameInput.value,
        alamat: addressInput.value,
        password: passwordInput.value,
        telephone: phoneInput.value,
        gender: (genderInput.value === "Male") ? "M" : "F", // Konversi gender
        price_per_hour: price
    };
    const [error, response] = await createTrainer(newTrainerData);

    alert('Trainer created successfully!');
    console.log("Server response:", response);
    
    createTrainerForm.reset();
    closeModal();
    
    await loadData(); 
  });
  loadData();
});
