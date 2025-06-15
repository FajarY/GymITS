import { getAllTrainers } from "../../requestScript.js";

const trainerListContainer = document.getElementById("trainer-list");
const filterBtn = document.getElementById("filter-trainers-btn");
const noResultsMessage = document.getElementById("no-results");

let filterIsActive = false;

const formatCurrency = (value) => {
  const number = parseFloat(value);
  if (isNaN(number)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const renderTrainers = (trainers) => {
  trainerListContainer.innerHTML = "";
  noResultsMessage.classList.add("hidden");

  if (!trainers || trainers.length === 0) {
    noResultsMessage.classList.remove("hidden");
    return;
  }

  trainers.forEach((trainer) => {
    const imageUrl = `https://placehold.co/400x300/3490F3/FFFFFF?text=${encodeURIComponent(
      trainer.name
    )}`;
    const trainerCard = document.createElement("div");
    trainerCard.dataset.trainerId = trainer.id;
    trainerCard.className =
      "trainer-card bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow";

    trainerCard.innerHTML = `
        <img src="${imageUrl}" alt="${trainer.name}" class="w-full h-48 object-cover">
        <div class="p-6 flex flex-col flex-grow">
            <h3 class="text-xl font-bold text-[#0d141c]">${trainer.name}</h3>
            <p class="text-md text-gray-700 font-semibold mt-1">${formatCurrency(
              trainer.price_per_hour
            )} / hour</p>
            <a href="/appointment/personal-trainer/trainer-availability/?id=${
              trainer.id
            }" class="view-availability-btn block w-full text-center mt-6 bg-[#3490f3] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#2579d5] transition">
                View Availability
            </a>
        </div>
    `;
    trainerListContainer.appendChild(trainerCard);
  });
};

const loadTrainers = async () => {
  trainerListContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">Loading trainers...</p>`;
  noResultsMessage.classList.add("hidden");
  filterBtn.disabled = true;

  try {
    const filter = filterIsActive ? "used" : null;
    const [res, data] = await getAllTrainers(filter);

    if (res.ok && data.status) {
      renderTrainers(data.data);
    } else {
      throw new Error(data.message || "Failed to fetch trainers.");
    }
  } catch (error) {
    console.error("Error loading trainers:", error);
    trainerListContainer.innerHTML = `<p class="col-span-full text-center text-red-500">${error.message}</p>`;
  } finally {
    filterBtn.disabled = false;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  filterBtn.addEventListener("click", () => {
    filterIsActive = !filterIsActive;

    if (filterIsActive) {
      filterBtn.textContent = "Show All Trainers";
      filterBtn.classList.add("bg-slate-600", "hover:bg-slate-700");
      filterBtn.classList.remove("bg-[#3490f3]", "hover:bg-[#2579d5]");
    } else {
      filterBtn.textContent = "Show My Previous Trainers";
      filterBtn.classList.remove("bg-slate-600", "hover:bg-slate-700");
      filterBtn.classList.add("bg-[#3490f3]", "hover:bg-[#2579d5]");
    }

    loadTrainers();
  });

  loadTrainers();
});