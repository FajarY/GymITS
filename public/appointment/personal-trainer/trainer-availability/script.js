// Updated mock data to reflect database structure and use pt_id as key
const trainersData = {
    'PT001': { 
        name: 'John Doe', 
        price_per_hour: 250000, 
        imageUrl: 'https://placehold.co/400x300/3490F3/FFFFFF?text=John+D', 
        availability: { 
            10: ['08:00', '09:00', '10:00'], 12: ['08:00', '09:00'], 15: ['14:00', '15:00', '16:00'], 
            17: ['17:00', '18:00'], 20: ['09:00', '10:00'], 22: ['08:00', '14:00', '15:00'], 25: ['16:00', '17:00', '18:00']
        } 
    },
    'PT002': { 
        name: 'Jane Smith', 
        price_per_hour: 300000,
        imageUrl: 'https://placehold.co/400x300/10B981/FFFFFF?text=Jane+S', 
        availability: { 
            11: ['07:00', '08:00'], 13: ['18:00', '19:00'], 16: ['07:00', '08:00', '09:00'], 
            18: ['18:00', '19:00', '20:00'], 21: ['07:00', '18:00'], 23: ['08:00', '09:00'], 26: ['18:00', '19:00']
        } 
    },
    'PT003': { 
        name: 'Mike Johnson', 
        price_per_hour: 275000,
        imageUrl: 'https://placehold.co/400x300/F59E0B/FFFFFF?text=Mike+J', 
        availability: { 
            12: ['08:00', '09:00'], 17: ['17:00', '18:00', '19:00'], 24: ['08:00'],
            14: ['15:00', '16:00'], 19: ['17:00', '18:00'], 27: ['08:00', '09:00', '10:00']
        } 
    },
    'PT004': { 
        name: 'Sarah Lee', 
        price_per_hour: 325000,
        imageUrl: 'https://placehold.co/400x300/EF4444/FFFFFF?text=Sarah+L', 
        availability: { 
            13: ['06:00', '07:00'], 15: ['17:00', '18:00'], 18: ['06:00', '07:00', '17:00'], 
            20: ['17:00', '18:00'], 22: ['06:00', '17:00'], 28: ['06:00', '07:00', '18:00'], 30: ['17:00', '18:00']
        } 
    },
};

async function fetchTrainerDetails(id) {
  console.log(`Fetching details for trainer: ${id}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (trainersData[id]) {
        resolve(trainersData[id]);
      } else {
        reject(new Error("Trainer not found"));
      }
    }, 500); // Simulate network delay
  });
}

// --- GLOBAL STATE ---
let selectedDate = null;
let selectedTime = null;
let currentTrainer = null;
let currentTrainerId = null;

// --- DOM ELEMENT REFERENCES ---
const loader = document.getElementById("loader");
const content = document.getElementById("content");
const trainerImage = document.getElementById("trainer-image");
const trainerName = document.getElementById("trainer-name");
const trainerPrice = document.getElementById("trainer-price"); // <-- New reference
const calendarContainer = document.getElementById("calendar-container");
const timeSlotsGrid = document.getElementById("time-slots-grid");
const timeSlotPlaceholder = document.getElementById("time-slot-placeholder");
const confirmAppointmentBtn = document.getElementById("confirm-appointment-btn");
const modalBackdrop = document.getElementById("confirm-modal-backdrop");
const modal = document.getElementById("confirm-modal");
const modalTrainerName = document.getElementById("modal-trainer-name");
const modalDate = document.getElementById("modal-date");
const modalTime = document.getElementById("modal-time");

// --- RENDER FUNCTIONS ---

/**
 * Creates and displays the monthly calendar.
 * @param {object} availability - The trainer's availability object.
 */
function renderCalendar(availability) {
  // Using a fixed date (June 2025) for demonstration so the mock data works reliably.
  const now = new Date(2025, 5, 9);
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const monthName = now.toLocaleString("default", { month: "long" });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let calendarHTML = `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">${monthName} ${year}</h3>
                </div>
                <div class="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
                    ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                      .map((day) => `<div>${day}</div>`)
                      .join("")}
                </div>
                <div class="grid grid-cols-7 gap-2">`;

  // Add blank days for the first week
  calendarHTML += "<div></div>".repeat(firstDayOfMonth);

  // Add all the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isAvailable = availability[day] && availability[day].length > 0;
    const isPast = day < today;
    let dayClasses = "p-2 text-center rounded-full text-gray-400"; // Default for past or unavailable days
    if (isAvailable && !isPast) {
      dayClasses =
        "calendar-day cursor-pointer bg-blue-50 hover:bg-blue-200 rounded-full p-2 text-center";
    }
    calendarHTML += `<div class="${dayClasses}" data-day="${day}">${day}</div>`;
  }

  calendarHTML += `</div>`;
  calendarContainer.innerHTML = calendarHTML;
}

/**
 * Displays the available time slots for a given date.
 * @param {string[]} times - An array of available time strings.
 */
function renderTimeSlots(times) {
  timeSlotsGrid.innerHTML = "";
  if (times && times.length > 0) {
    timeSlotPlaceholder.classList.add("hidden");
    timeSlotsGrid.classList.remove("hidden");
    times.forEach((time) => {
      const timeSlotBtn = document.createElement("button");
      timeSlotBtn.className =
        "time-slot border border-gray-300 rounded-lg p-2 hover:bg-gray-100";
      timeSlotBtn.textContent = time;
      timeSlotBtn.dataset.time = time;
      timeSlotsGrid.appendChild(timeSlotBtn);
    });
  } else {
    timeSlotPlaceholder.textContent = "No available times for this date.";
    timeSlotPlaceholder.classList.remove("hidden");
    timeSlotsGrid.classList.add("hidden");
  }
}

/**
 * Updates the entire page with the details of the fetched trainer.
 * @param {object} trainerData - The fetched trainer object.
 */
function populatePage(trainerData) {
  currentTrainer = trainerData;
  trainerImage.src = trainerData.imageUrl;
  trainerImage.alt = trainerData.name;
  trainerName.textContent = trainerData.name;
  // Set the price per hour
  trainerPrice.textContent = `${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trainerData.price_per_hour)} / hour`;
  renderCalendar(trainerData.availability);
  loader.classList.add("hidden");
  content.classList.remove("hidden");
}

// --- MODAL LOGIC ---
function showConfirmationModal() {
  modalTrainerName.textContent = currentTrainer.name;
  modalDate.textContent = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  modalTime.textContent = `at ${selectedTime}`;
  modalBackdrop.classList.remove("hidden");
  setTimeout(() => {
    modalBackdrop.classList.remove("opacity-0");
    modal.classList.remove("opacity-0", "scale-95");
  }, 10);
}

function hideConfirmationModal() {
  modalBackdrop.classList.add("opacity-0");
  modal.classList.add("opacity-0", "scale-95");
  setTimeout(() => modalBackdrop.classList.add("hidden"), 300);
}

// --- EVENT HANDLERS ---
function handleDateSelection(e) {
  if (!e.target.matches(".calendar-day[data-day]")) return;

  document.querySelectorAll(".calendar-day.bg-blue-500").forEach((el) => {
    el.classList.replace("bg-blue-500", "bg-blue-50");
    el.classList.remove("text-white");
  });

  e.target.classList.replace("bg-blue-50", "bg-blue-500");
  e.target.classList.add("text-white");

  const day = e.target.dataset.day;
  selectedDate = new Date(2025, 5, day);
  selectedTime = null;
  confirmAppointmentBtn.disabled = true;

  renderTimeSlots(currentTrainer.availability[day] || []);
}

function handleTimeSelection(e) {
  if (!e.target.matches(".time-slot[data-time]")) return;

  document
    .querySelectorAll(".time-slot.bg-blue-500")
    .forEach((el) => el.classList.remove("bg-blue-500", "text-white"));

  e.target.classList.add("bg-blue-500", "text-white");
  selectedTime = e.target.dataset.time;
  confirmAppointmentBtn.disabled = false;
}

function handleConfirmBooking() {
  console.log(
    `Booking confirmed for ${currentTrainer.name} on ${selectedDate} at ${selectedTime}`
  );
  
  const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
  const newBooking = {
    id: Date.now().toString(),
    trainerId: currentTrainerId, // Use the ID from the URL
    trainerName: currentTrainer.name,
    date: selectedDate.toISOString(),
    time: selectedTime,
    status: 'confirmed'
  };
  
  bookings.push(newBooking);
  localStorage.setItem('userBookings', JSON.stringify(bookings));
  
  hideConfirmationModal();
  
  alert('Appointment booked successfully!');
  setTimeout(() => {
    window.location.href = '/appointment/my-appointment/';
  }, 1000);
}

// --- PAGE INITIALIZATION ---

/**
* Gets the trainer ID from the current page's URL query string.
* @returns {string|null} The trainer ID or null if not found.
*/
function getTrainerIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function initializePage() {
  // --- FIX: Get trainer ID from URL instead of localStorage ---
  currentTrainerId = getTrainerIdFromURL();
  
  if (!currentTrainerId) {
    loader.textContent = "Error: No trainer selected. Please go back and select a trainer.";
    return;
  }

  if (!trainersData[currentTrainerId]) {
    loader.textContent = "Error: Trainer not found.";
    return;
  }

  try {
    const trainerData = await fetchTrainerDetails(currentTrainerId);
    populatePage(trainerData);
  } catch (error) {
    loader.textContent = "Could not find trainer details.";
    console.error(error);
  }
}

// --- ATTACH EVENT LISTENERS ---
function attachEventListeners() {
  if (calendarContainer) {
    calendarContainer.addEventListener("click", handleDateSelection);
  }
  if (timeSlotsGrid) {
    timeSlotsGrid.addEventListener("click", handleTimeSelection);
  }
  if (confirmAppointmentBtn) {
    confirmAppointmentBtn.addEventListener("click", showConfirmationModal);
  }
  
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalConfirmBtn = document.getElementById("modal-confirm-btn");
  
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", hideConfirmationModal);
  }
  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener("click", handleConfirmBooking);
  }
}

// --- Initialize on page load ---
document.addEventListener("DOMContentLoaded", () => {
  attachEventListeners();
  initializePage();
});
