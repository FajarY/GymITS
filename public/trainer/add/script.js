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
  createTrainerForm.addEventListener('submit', (event) => {
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


    // Simulate sending to backend and getting a new ID
    const newTrainerId = Date.now(); // Use timestamp as a unique ID for this example
    
    console.log("Creating new trainer with the following data:");
    console.log({ id: newTrainerId, name, phone, password, gender, address, price });

    // Create the new trainer card HTML
    const newCard = document.createElement('div');
    newCard.className = 'trainer-card flex flex-col bg-white rounded-lg shadow-md overflow-hidden';
    newCard.setAttribute('data-trainer-id', newTrainerId);
    newCard.innerHTML = `
      <img src="https://placehold.co/400x300/4a5568/white?text=Trainer" alt="Trainer Image" class="w-full h-48 object-cover">
      <div class="p-6 flex-grow flex flex-col">
          <h3 class="trainer-name text-xl font-bold text-[#0d141c]">${name}</h3>
          <p class="trainer-gender text-sm text-gray-500">${gender}</p>
          <p class="trainer-price text-lg font-semibold text-gray-700 mt-2">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price)} / hour</p>
          <p class="trainer-phone text-sm text-gray-500 mt-2">Tel: ${phone}</p>
      </div>
    `;

    // Add the new card to the list and reset the form
    trainerListContainer.appendChild(newCard);
    createTrainerForm.reset();
    closeModal();
  });
});
