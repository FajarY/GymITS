// --- Mock Data and API Simulation ---
const trainersData = {
    'john-doe': { name: 'John Doe', specialty: 'Strength Training', specialtyColor: 'text-[#3490f3]', description: 'Expert in building muscle mass and creating effective weight loss programs.', imageUrl: 'https://placehold.co/400x300/3490F3/FFFFFF?text=John+D', availability: { 10: ['09:00', '10:00', '14:00'], 15: ['10:00', '11:00', '15:00', '16:00'], 22: ['09:00', '14:00'] }},
    'jane-smith': { name: 'Jane Smith', specialty: 'Yoga & Flexibility', specialtyColor: 'text-green-600', description: 'Certified yoga instructor focusing on Vinyasa flows and improving mobility.', imageUrl: 'https://placehold.co/400x300/10B981/FFFFFF?text=Jane+S', availability: { 11: ['10:00', '11:00', '12:00'], 16: ['13:00', '14:00'], 23: ['10:00', '11:00'] } },
    'mike-johnson': { name: 'Mike Johnson', specialty: 'Cardio & HIIT', specialtyColor: 'text-amber-600', description: 'High-intensity interval training specialist to boost your endurance and burn calories.', imageUrl: 'https://placehold.co/400x300/F59E0B/FFFFFF?text=Mike+J', availability: { 12: ['08:00', '09:00'], 17: ['17:00', '18:00', '19:00'], 24: ['08:00'] } },
    'sarah-lee': { name: 'Sarah Lee', specialty: 'CrossFit', specialtyColor: 'text-red-600', description: 'Level 2 CrossFit coach specializing in functional fitness and Olympic lifts.', imageUrl: 'https://placehold.co/400x300/EF4444/FFFFFF?text=Sarah+L', availability: { 13: ['07:00', '08:00'], 18: ['16:00'], 25: ['07:00', '17:00'] } },
};

async function fetchTrainerDetails(id) {
    console.log(`Fetching details for trainer: ${id}`);
    // In a real app, use fetchJson(`/api/trainers/${id}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (trainersData[id]) {
                resolve(trainersData[id]);
            } else {
                reject(new Error("Trainer not found"));
            }
        }, 500);
    });
}

// --- State Management ---
let selectedDate = null;
let selectedTime = null;
let currentTrainer = null;

// --- DOM Elements ---
const loader = document.getElementById('loader');
const content = document.getElementById('content');
const trainerImage = document.getElementById('trainer-image');
const trainerName = document.getElementById('trainer-name');
const trainerSpecialty = document.getElementById('trainer-specialty');
const trainerDescription = document.getElementById('trainer-description');
const calendarContainer = document.getElementById('calendar-container');
const timeSlotsContainer = document.getElementById('time-slots-container');
const timeSlotsGrid = document.getElementById('time-slots-grid');
const timeSlotPlaceholder = document.getElementById('time-slot-placeholder');
const confirmAppointmentBtn = document.getElementById('confirm-appointment-btn');
        
// --- Calendar Logic ---
function renderCalendar(availability) {
    const now = new Date(2025, 5, 8); // June 8, 2025
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthName = now.toLocaleString('default', { month: 'long' });
    let calendarHTML = `
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">${monthName} ${year}</h3>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div class="grid grid-cols-7 gap-2">`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isAvailable = availability[day] && availability[day].length > 0;
        const isPast = day < now.getDate();
        const dayClasses = isAvailable && !isPast
            ? 'calendar-day cursor-pointer bg-blue-50 hover:bg-blue-200 rounded-full'
            : 'text-gray-400';
        calendarHTML += `<div class="${dayClasses} p-2" data-day="${day}">${day}</div>`;
    }

    calendarHTML += `</div>`;
        calendarContainer.innerHTML = calendarHTML;
}

// --- Time Slot Logic ---
function renderTimeSlots(times) {
    timeSlotPlaceholder.classList.add('hidden');
    timeSlotsGrid.classList.remove('hidden');
    timeSlotsGrid.innerHTML = '';
    times.forEach(time => {
        const timeSlotBtn = document.createElement('button');
        timeSlotBtn.className = 'time-slot border border-gray-300 rounded-lg p-2 hover:bg-gray-100';
        timeSlotBtn.textContent = time;
        timeSlotBtn.dataset.time = time;
        timeSlotsGrid.appendChild(timeSlotBtn);
    });
}

// --- Event Listeners ---
calendarContainer.addEventListener('click', (e) => {
    if (e.target.matches('.calendar-day[data-day]')) {
        // Remove selection from previous day
        document.querySelectorAll('.calendar-day.bg-blue-500').forEach(el => el.classList.replace('bg-blue-500', 'bg-blue-50'));
        // Select new day
        e.target.classList.replace('bg-blue-50', 'bg-blue-500');
        e.target.classList.add('text-white');

        const day = e.target.dataset.day;
        selectedDate = new Date(2025, 5, day);
        selectedTime = null; // Reset time
        renderTimeSlots(currentTrainer.availability[day] || []);
        confirmAppointmentBtn.disabled = true;
    }
});

timeSlotsGrid.addEventListener('click', (e) => {
    if (e.target.matches('.time-slot[data-time]')) {
        document.querySelectorAll('.time-slot.bg-blue-500').forEach(el => el.classList.remove('bg-blue-500', 'text-white'));
        e.target.classList.add('bg-blue-500', 'text-white');
        selectedTime = e.target.dataset.time;
        confirmAppointmentBtn.disabled = false;
    }
});

// --- Modal Logic ---
const modalBackdrop = document.getElementById('confirm-modal-backdrop');
const modal = document.getElementById('confirm-modal');
const modalTrainerName = document.getElementById('modal-trainer-name');
const modalDate = document.getElementById('modal-date');
const modalTime = document.getElementById('modal-time');

function showConfirmationModal() {
     modalTrainerName.textContent = currentTrainer.name;
     modalDate.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
     modalTime.textContent = `at ${selectedTime}`;
     modalBackdrop.classList.remove('hidden');
     setTimeout(() => {
        modalBackdrop.classList.remove('opacity-0');
        modal.classList.remove('opacity-0', 'scale-95');
     }, 10);
}
function hideConfirmationModal() {
     modalBackdrop.classList.add('opacity-0');
     modal.classList.add('opacity-0', 'scale-95');
     setTimeout(() => modalBackdrop.classList.add('hidden'), 300);
}

confirmAppointmentBtn.addEventListener('click', showConfirmationModal);
document.getElementById('modal-close-btn').addEventListener('click', hideConfirmationModal);
document.getElementById('modal-confirm-btn').addEventListener('click', () => {
     console.log(`Booking confirmed for ${currentTrainer.name} on ${selectedDate} at ${selectedTime}`);
     // Add real API call here
     hideConfirmationModal();
     // Maybe show a success message or redirect
});

// --- Initial Page Load ---
document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/');
    const trainerId = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];

    if (!trainerId) {
        loader.textContent = "No trainer ID provided.";
        return;
    }

    try {
        currentTrainer = await fetchTrainerDetails(trainerId);
        
        // Populate profile
        trainerImage.src = currentTrainer.imageUrl;
        trainerImage.alt = currentTrainer.name;
        trainerName.textContent = currentTrainer.name;
        trainerSpecialty.textContent = currentTrainer.specialty;
        trainerSpecialty.className = `text-lg font-medium mt-1 ${currentTrainer.specialtyColor}`;
        trainerDescription.textContent = currentTrainer.description;
        
        // Render calendar
        renderCalendar(currentTrainer.availability);

        // Show content
        loader.classList.add('hidden');
        content.classList.remove('hidden');

    } catch (error) {
        loader.textContent = "Could not find trainer details.";
        console.error(error);
    }
});