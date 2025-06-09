//  mock data
const allTrainers = [
    { id: 'john-doe', name: 'John Doe', specialty: 'Strength Training', specialtyColor: 'text-[#3490f3]', description: 'Expert in building muscle mass and creating effective weight loss programs.', imageUrl: 'https://placehold.co/400x300/3490F3/FFFFFF?text=John+D' },
    { id: 'jane-smith', name: 'Jane Smith', specialty: 'Yoga & Flexibility', specialtyColor: 'text-green-600', description: 'Certified yoga instructor focusing on Vinyasa flows and improving mobility.', imageUrl: 'https://placehold.co/400x300/10B981/FFFFFF?text=Jane+S' },
    { id: 'mike-johnson', name: 'Mike Johnson', specialty: 'Cardio & HIIT', specialtyColor: 'text-amber-600', description: 'High-intensity interval training specialist to boost your endurance and burn calories.', imageUrl: 'https://placehold.co/400x300/F59E0B/FFFFFF?text=Mike+J' },
    { id: 'sarah-lee', name: 'Sarah Lee', specialty: 'CrossFit', specialtyColor: 'text-red-600', description: 'Level 2 CrossFit coach specializing in functional fitness and Olympic lifts.', imageUrl: 'https://placehold.co/400x300/EF4444/FFFFFF?text=Sarah+L' },
];

// --- DOM Elements ---
const trainerListContainer = document.getElementById("trainer-list");
const loadingMessage = document.getElementById("loading-message");

// --- Functions ---
async function fetchTrainers() {
  console.log("Fetching trainer data...");
  return new Promise((resolve) => setTimeout(() => resolve(allTrainers), 500));
}

function renderTrainers(trainers) {
  trainerListContainer.innerHTML = ""; // Clear loading message
  
  if (trainers.length === 0) {
    document.getElementById("no-results").classList.remove("hidden");
    return;
  }

  trainers.forEach((trainer) => {
    const trainerCard = document.createElement("div");
    trainerCard.className =
      "trainer-card bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow";

    trainerCard.innerHTML = `
                    <img src="${trainer.imageUrl}" alt="${trainer.name}" class="w-full h-48 object-cover">
                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold text-[#0d141c]">${trainer.name}</h3>
                        <p class="text-sm ${trainer.specialtyColor} font-medium mb-2">${trainer.specialty}</p>
                        <p class="text-gray-600 text-sm mb-6 flex-grow">${trainer.description}</p>
                        <button class="view-availability-btn w-full text-center mt-auto bg-[#3490f3] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#2579d5] transition" data-trainer-id="${trainer.id}">
                            View Availability
                        </button>
                    </div>
                `;
    trainerListContainer.appendChild(trainerCard);
  });
}

// --- Event Handlers ---
function handleTrainerSelection(e) {
  const button = e.target.closest('.view-availability-btn');
  if (!button) return;
  
  const trainerId = button.dataset.trainerId;
  if (trainerId) {
    // Store trainer ID in localStorage to pass to the next page
    localStorage.setItem('selectedTrainerId', trainerId);
    
    // Navigate to time-availability page
    window.location.href = '/appointment/personal-trainer/trainer-availability/';
  }
}

// --- Event Listeners ---
document.addEventListener("click", handleTrainerSelection);

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