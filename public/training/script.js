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


const startState = document.getElementById("start-state");
const activeState = document.getElementById("active-state");
const startBtn = document.getElementById("start-session-btn");
const startBtnText = document.getElementById("start-btn-text");
const endLink = document.getElementById("end-session-link");
const sessionIdDisplay = document.getElementById("session-id-display");
const barcodeContainer = document.getElementById("barcode-container");

const sessionCountText = document.getElementById('session-count');
const currentStreakText = document.getElementById('training-streak');
const totalTrainingTimeText = document.getElementById('total-training-time');

var trainingSessionId;

async function initializeData()
{
  try
  {
    const req = {
        method: "GET"
    };

    const activeTrainingData = await tryFetchJson('/customer/training/listActive', req);
    
    if(activeTrainingData[1].data.length > 0)
    {
      startBtn.disabled = true;
      trainingSessionId = activeTrainingData[1].data[0].ts_id;

      updateToTraining();
    }
  }
  catch(error)
  {
    alert(error);
  }

  try
  {
    const req = {
        method: "GET"
    };

    const sessionCountData = await tryFetchJson('/customer/training-session-statistic', req);
    const streakData = await tryFetchJson('/customer/training/streak', req);
    const trainingTimeData = await tryFetchJson('/customer/training/total', req);

    const sessionCount = sessionCountData[1].data[0].total_sessions;
    const streakCount = streakData[1].data.hitung_streak_training_customer;
    const trainingTime = trainingTimeData[1].data.hitung_total_jam_training_customer;

    sessionCountText.textContent = sessionCount;
    currentStreakText.textContent = streakCount;
    totalTrainingTimeText.textContent = trainingTime;
  }
  catch(error)
  {
    console.log(error)
  }
}

async function initialize()
{
  initializeData();
}

initialize();

var needBuyMembership = false;

startBtn.addEventListener("click", async () =>
{
  if(needBuyMembership)
  {
    window.location.href = '/membership';
    return;
  }

  startBtn.disabled = true;
  startBtnText.textContent = "Starting...";

  const startReq = {
      method: "POST"
  };

  const startData = await tryFetchJson('/customer/training/start', startReq);

  if(!startData)
  {
    startBtn.disabled = false;
    startBtnText.textContent = "Error";
    alert(`There was an error when starting`);
    return;
  }
  if(!startData[1].status)
  {
    startBtnText.textContent = "Buy Membership";
    startBtn.disabled = false;
    needBuyMembership = true;
    alert(`${startData[1].error}`);
    return;
  }

  trainingSessionId = startData[1].data.id.ts_id;
  
  updateToTraining();
});

function updateToTraining()
{
  // --- 3. Update the page with the new data ---
  sessionIdDisplay.textContent = trainingSessionId;
  barcodeContainer.innerHTML = `
    <svg class="w-full h-auto mt-4" viewBox="0 0 200 50" fill="black" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="2" height="30"></rect><rect x="15" y="10" width="4" height="30"></rect><rect x="22" y="10" width="2" height="30"></rect><rect x="28" y="10" width="4" height="30"></rect><rect x="35" y="10" width="2" height="30"></rect><rect x="40" y="10" width="2" height="30"></rect><rect x="45" y="10" width="4" height="30"></rect><rect x="52" y="10" width="2" height="30"></rect><rect x="58" y="10" width="4" height="30"></rect><rect x="65" y="10" width="2" height="30"></rect><rect x="70" y="10" width="4" height="30"></rect><rect x="78" y="10" width="2" height="30"></rect><rect x="84" y="10" width="2" height="30"></rect><rect x="90" y="10" width="4" height="30"></rect><rect x="98" y="10" width="4" height="30"></rect><rect x="105" y="10" width="2" height="30"></rect><rect x="110" y="10" width="4" height="30"></rect><rect x="118" y="10" width="2" height="30"></rect><rect x="124" y="10" width="2" height="30"></rect><rect x="130" y="10" width="4" height="30"></rect><rect x="138" y="10" width="2" height="30"></rect><rect x="144" y="10" width="4" height="30"></rect><rect x="152" y="10" width="2" height="30"></rect><rect x="158" y="10" width="4" height="30"></rect><rect x="165" y="10" width="2" height="30"></rect>
    </svg>
  `;

  // --- 4. Switch the visible state ---
  startState.classList.add("hidden"); // Hide the start card
  activeState.classList.remove("hidden"); // Show the active session card
  activeState.classList.add("flex"); // Add flex to make it display correctly
}

// --- 5. Define what happens when "End Session" is clicked ---
endLink.addEventListener("click", async (event) =>
{
  // Prevent the link from immediately redirecting
  event.preventDefault();

  const endReq = {
      method: "POST"
  };

  const endData = await tryFetchJson(`/customer/training/end/${trainingSessionId}`, endReq);
  if(!endData)
  {
    alert('There was an error when ending session');
    return;
  }

  if(!endData[1].status)
  {
    alert(`${endData[1].error}`);
    return;
  }

  alert('Session ended successfully');
  window.location.href = endLink.href;
});
