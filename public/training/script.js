// Wait for the HTML document to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Get references to all the important HTML elements ---
  const startState = document.getElementById("start-state");
  const activeState = document.getElementById("active-state");
  const startBtn = document.getElementById("start-session-btn");
  const startBtnText = document.getElementById("start-btn-text");
  const endLink = document.getElementById("end-session-link");
  const sessionIdDisplay = document.getElementById("session-id-display");
  const barcodeContainer = document.getElementById("barcode-container");

  // --- 2. Define what happens when "Start Session" is clicked ---
  startBtn.addEventListener("click", () => {
    // Provide visual feedback that something is happening
    startBtn.disabled = true;
    startBtnText.textContent = "Starting...";

    // FAKE a request to the backend. In a real app, this would be a 'fetch' call.
    // We use setTimeout to simulate a 1.5 second network delay.
    console.log("Sending request to backend to start session...");
    setTimeout(() => {
      // FAKE response data from the backend
      const backendResponse = {
        sessionId: "GYM-8B3Z1A",
        barcodeSvg: `
          <svg class="w-full h-auto mt-4" viewBox="0 0 200 50" fill="black" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="2" height="30"></rect><rect x="15" y="10" width="4" height="30"></rect><rect x="22" y="10" width="2" height="30"></rect><rect x="28" y="10" width="4" height="30"></rect><rect x="35" y="10" width="2" height="30"></rect><rect x="40" y="10" width="2" height="30"></rect><rect x="45" y="10" width="4" height="30"></rect><rect x="52" y="10" width="2" height="30"></rect><rect x="58" y="10" width="4" height="30"></rect><rect x="65" y="10" width="2" height="30"></rect><rect x="70" y="10" width="4" height="30"></rect><rect x="78" y="10" width="2" height="30"></rect><rect x="84" y="10" width="2" height="30"></rect><rect x="90" y="10" width="4" height="30"></rect><rect x="98" y="10" width="4" height="30"></rect><rect x="105" y="10" width="2" height="30"></rect><rect x="110" y="10" width="4" height="30"></rect><rect x="118" y="10" width="2" height="30"></rect><rect x="124" y="10" width="2" height="30"></rect><rect x="130" y="10" width="4" height="30"></rect><rect x="138" y="10" width="2" height="30"></rect><rect x="144" y="10" width="4" height="30"></rect><rect x="152" y="10" width="2" height="30"></rect><rect x="158" y="10" width="4" height="30"></rect><rect x="165" y="10" width="2" height="30"></rect>
          </svg>
        `,
      };
      console.log("Received response:", backendResponse);

      // --- 3. Update the page with the new data ---
      sessionIdDisplay.textContent = backendResponse.sessionId;
      barcodeContainer.innerHTML = backendResponse.barcodeSvg;

      // --- 4. Switch the visible state ---
      startState.classList.add("hidden"); // Hide the start card
      activeState.classList.remove("hidden"); // Show the active session card
      activeState.classList.add("flex"); // Add flex to make it display correctly
    }, 1500);
  });

  // --- 5. Define what happens when "End Session" is clicked ---
  endLink.addEventListener("click", (event) => {
    // Prevent the link from immediately redirecting
    event.preventDefault();

    // In a real app, you would send another request to your backend here to
    // officially end the session.
    console.log("Sending request to backend to end session...");

    // Redirect to the dashboard page after a short delay
    setTimeout(() => {
      window.location.href = endLink.href; // Redirect to the href in the <a> tag
    }, 500);
  });
});
