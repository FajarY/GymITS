//  mock data (Updated to match database structure)
const allTrainers = [
    { pt_id: 'PT001', pt_name: 'John Doe', pt_price_per_hour: 250000, imageUrl: 'https://placehold.co/400x300/3490F3/FFFFFF?text=John+D' },
    { pt_id: 'PT002', pt_name: 'Jane Smith', pt_price_per_hour: 300000, imageUrl: 'https://placehold.co/400x300/10B981/FFFFFF?text=Jane+S' },
    { pt_id: 'PT003', pt_name: 'Mike Johnson', pt_price_per_hour: 275000, imageUrl: 'https://placehold.co/400x300/F59E0B/FFFFFF?text=Mike+J' },
    { pt_id: 'PT004', pt_name: 'Sarah Lee', pt_price_per_hour: 325000, imageUrl: 'https://placehold.co/400x300/EF4444/FFFFFF?text=Sarah+L' },
];

// SIMULATED data from your query
const previouslyUsedTrainerIds = ['PT001', 'PT004']; // Example: User has used John Doe and Sarah Lee before

// --- DOM Elements ---
const trainerListContainer = document.getElementById("trainer-list");
const loadingMessage = document.getElementById("loading-message");
const filterBtn = document.getElementById("filter-trainers-btn");
const noResultsMessage = document.getElementById("no-results");

// --- STATE ---
let filterIsActive = false;

// --- Functions ---
async function fetchTrainers() {
  console.log("Fetching trainer data...");
  return new Promise((resolve) => setTimeout(() => resolve(allTrainers), 500));
}

function renderTrainers(trainers) {
  trainerListContainer.innerHTML = ""; // Clear loading message
  noResultsMessage.classList.add("hidden");
  
  if (trainers.length === 0) {
    noResultsMessage.classList.remove("hidden");
    return;
  }

  trainers.forEach((trainer) => {
    const trainerCard = document.createElement("div");
    // Add data-trainer-id for filtering
    trainerCard.dataset.trainerId = trainer.pt_id; 
    trainerCard.className =
      "trainer-card bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow";

    // Updated card structure
    trainerCard.innerHTML = `
        <img src="${trainer.imageUrl}" alt="${trainer.pt_name}" class="w-full h-48 object-cover">
        <div class="p-6 flex flex-col flex-grow">
            <h3 class="text-xl font-bold text-[#0d141c]">${trainer.pt_name}</h3>
            <p class="text-md text-gray-700 font-semibold mt-1">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(trainer.pt_price_per_hour)} / hour</p>
            <button class="view-availability-btn w-full text-center mt-6 bg-[#3490f3] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#2579d5] transition" data-trainer-id="${trainer.pt_id}">
                View Availability
            </button>
        </div>
    `;
    trainerListContainer.appendChild(trainerCard);
  });
}

// --- NEW: Function to filter trainers ---
function applyTrainerFilter() {
    const allTrainerCards = document.querySelectorAll('.trainer-card');
    allTrainerCards.forEach(card => {
        const trainerId = card.dataset.trainerId;

        if (filterIsActive) {
            // Filter is ON: show only previously used trainers
            if (previouslyUsedTrainerIds.includes(trainerId)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        } else {
            // Filter is OFF: show all trainers
            card.style.display = 'flex';
        }
    });
}


// --- Event Handlers ---
function handleTrainerSelection(e) {
  const button = e.target.closest('.view-availability-btn');
  if (!button) return;
  
  const trainerId = button.dataset.trainerId;
  if (trainerId) {
    // Navigate to the next page
    window.location.href = `/appointment/personal-trainer/trainer-availability/?id=${trainerId}`;
  }
}

// --- Event Listeners ---
document.addEventListener("click", handleTrainerSelection);

// --- NEW: Filter button event listener ---
filterBtn.addEventListener('click', () => {
    filterIsActive = !filterIsActive; // Toggle the filter
    applyTrainerFilter();

    // Update button text and style
    if (filterIsActive) {
        filterBtn.textContent = 'Show All Trainers';
        filterBtn.classList.add('bg-slate-600', 'hover:bg-slate-700');
        filterBtn.classList.remove('bg-[#3490f3]', 'hover:bg-[#2579d5]');
    } else {
        filterBtn.textContent = 'Show My Previous Trainers';
        filterBtn.classList.remove('bg-slate-600', 'hover:bg-slate-700');
        filterBtn.classList.add('bg-[#3490f3]', 'hover:bg-[#2579d5]');
    }
});


// --- Initial Load ---
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const trainers = await fetchTrainers();
    renderTrainers(trainers);
  } catch (error) {
    loadingMessage.textContent = "Failed to load trainers.";
    console.error("Failed to fetch trainers:", error);
  }
});
