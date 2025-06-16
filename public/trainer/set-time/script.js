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

const getMonthavailability = async (month, year) => {
    const parsed = parseJwt(getCookie("token"))
    const req = {
        method : "GET",
    }

    return await tryFetchJson(`/personaltrainer/${parsed.id}/availability?month=${month}&year=${year}`, req); 
}

const saveAvailability = async (payload) => {
    const req = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    };
    return await tryFetchJson('/personaltrainer/available-time', req);
};

document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM ELEMENT REFERENCES ---
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const saveBtn = document.getElementById('save-availability-btn');

    // --- STATE MANAGEMENT ---
    // Simulating the current time as per your example for consistency
    const now = new Date(); 
    let currentDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start calendar on the 1st of the current month
    let selectedDate = null;
    let selectedTimeSlots = [];

    // --- TIME SLOTS DEFINITION ---
    const timeSlots = [
        '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '12:00-13:00','13:00-14:00', '14:00-15:00', '15:00-16:00', 
        '16:00-17:00','17:00-18:00', '18:00-19:00', '19:00-20:00', 
        '20:00-21:00', '21:00-22:00'
    ];
    const [_, res] = await getMonthavailability(now.getMonth() + 1, now.getFullYear());
    let monthTimeSlots = res.data;
    let dailyAvailabilityData = {}; 
    monthTimeSlots.forEach(item => {
        const dateKey = new Date(item.at_date).getDate();
        dailyAvailabilityData[dateKey] = item.map_time;
    });

    // --- FUNCTIONS ---

    /**
     * Renders the calendar for the month and year of the `currentDate`
     */
    function renderCalendar() {
        calendarDaysGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // This represents the start of today, for date comparison
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Set header text (e.g., "June 2025")
        monthYearHeader.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(currentDate);

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add blank cells for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDaysGrid.innerHTML += '<div></div>';
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayButton = document.createElement('button');
            const loopDate = new Date(year, month, day);
            
            dayButton.textContent = day;
            dayButton.dataset.day = day;
            dayButton.className = "p-2 rounded-full hover:bg-slate-100 transition";
            
            // --- VALIDATION RULE 1: Disable past dates ---
            if (loopDate < todayDate) {
                dayButton.disabled = true;
                dayButton.classList.add('text-gray-300', 'cursor-not-allowed');
                dayButton.classList.remove('hover:bg-slate-100');
            }
            
            // Highlight the current day from our "now" variable
            if (loopDate.getTime() === todayDate.getTime()) {
                dayButton.classList.add('bg-blue-200', 'text-blue-800');
            }
            
            // Highlight the selected day
            if (selectedDate && loopDate.getTime() === selectedDate.getTime()) {
                 dayButton.classList.add('bg-[#3490f3]', 'text-white');
                 dayButton.classList.remove('hover:bg-slate-100', 'bg-blue-200', 'text-blue-800');
            }

            calendarDaysGrid.appendChild(dayButton);
        }
    }

    /**
     * Renders the time slot buttons
     */
    function renderTimeSlots() {
        timeSlotsContainer.innerHTML = '';
        timeSlots.forEach((slot, index) => {
            const slotButton = document.createElement('button');
            slotButton.textContent = slot.replace('-', ' - ');
            slotButton.dataset.slot = slot;
            slotButton.dataset.index = index; 
            slotButton.className = "time-slot p-2 border rounded-md text-sm hover:bg-slate-100 transition";
            timeSlotsContainer.appendChild(slotButton);
        });
    }

    /**
     * Resets time slot selections
     */
    function resetTimeSlots(day) {
        selectedTimeSlots = [];
        const timeStatus = dailyAvailabilityData[day];

        document.querySelectorAll('.time-slot').forEach((btn, i) => {

            if (!timeStatus || timeStatus[i] === null) {
                btn.classList.remove('bg-[#3490f3]', 'text-white', 'border-transparent');
                btn.disabled = false;
                btn.classList.remove('opacity-50', 'pointer-events-none');  
                btn.classList.add('hover:bg-slate-100');
            } else {
                btn.classList.remove('bg-[#3490f3]', 'text-white', 'border-transparent', 'hover:bg-slate-100');
                btn.disabled = true;             
                btn.classList.add('opacity-50', 'pointer-events-none'); 
                btn.removeAttribute('data-id'); 
            } 
        });
    }
    
    /**
     * Formats date as YYYY-MM-DD for the database
     */
    function formatDateForDB(date) {
        const year = date.getFullYear();
        
        const month = String(date.getMonth() + 1).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    
    // --- EVENT LISTENERS ---

    // Calendar navigation
    prevMonthBtn.addEventListener('click', async () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        const [_, res] = await getMonthavailability(currentDate.getMonth() + 1, currentDate.getFullYear());
        monthTimeSlots = res.data;
        dailyAvailabilityData = {}
        monthTimeSlots.forEach(item => {
            const dateKey = new Date(item.at_date).getDate();
            dailyAvailabilityData[dateKey] = item.map_time;
        });
        renderTimeSlots();
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', async () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        const [_, res] = await getMonthavailability(currentDate.getMonth() + 1, currentDate.getFullYear());
        monthTimeSlots = res.data;
        dailyAvailabilityData = {}
        monthTimeSlots.forEach(item => {
            const dateKey = new Date(item.at_date).getDate();
            dailyAvailabilityData[dateKey] = item.map_time;
        });
        renderTimeSlots();
        renderCalendar();
    });

    // Day selection
    calendarDaysGrid.addEventListener('click', (event) => {
        const target = event.target;
        // Ensure the button is not disabled before selecting
        if (target.tagName === 'BUTTON' && target.dataset.day && !target.disabled) {
            const day = parseInt(target.dataset.day);
            selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            selectedDateDisplay.textContent = selectedDate.toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            saveBtn.disabled = false;
            resetTimeSlots(day);
            renderCalendar(); // Re-render to show selection
        }
    });
    
    // Time slot selection
    timeSlotsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON' && target.dataset.slot) {
            if (!selectedDate) {
                alert("Please select a date from the calendar first.");
                return;
            }

            // --- VALIDATION RULE 2: Disable past time slots on the current day ---
            const isToday = selectedDate.toDateString() === now.toDateString();
            if (isToday) {
                const slotStartHour = parseInt(target.dataset.slot.split(':')[0]);
                const currentHour = now.getHours();
                if (slotStartHour <= currentHour) {
                    alert("You cannot select a time slot that has already passed today.");
                    return; // Prevent selection
                }
            }

            // Toggle selection styles
            target.classList.toggle('bg-[#3490f3]');
            target.classList.toggle('text-white');
            target.classList.toggle('border-transparent');
            
            const index = parseInt(target.dataset.index);
            if (selectedTimeSlots.includes(index)) {
                selectedTimeSlots = selectedTimeSlots.filter(s => s !== index);
            } else {
                selectedTimeSlots.push(index);
            }
        }
    });

    // Save availability
    saveBtn.addEventListener('click', async () => {
        if (!selectedDate || selectedTimeSlots.length === 0) {
            alert("Please select a date and at least one time slot.");
            return;
        }
        
        const payload = {
            date: formatDateForDB(selectedDate),
            times: selectedTimeSlots
        };
        
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        selectedTimeSlots.sort();
        
       try {
            const [_, res] = await saveAvailability(payload);

            alert(`Availability for ${selectedDate.toLocaleDateString()} has been saved successfully!`);
            console.log("Server response:", res);

            selectedDate = null;
            selectedTimeSlots = [];
            selectedDateDisplay.textContent = 'Select a date';
            resetTimeSlots(null);
            renderCalendar();

        } catch (e) {
            console.error("An unexpected error occurred:", e);
            alert("An unexpected error occurred while saving.");
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Availability";
            location.reload()
        }
    });

    // --- INITIAL RENDER ---
    renderCalendar();
    renderTimeSlots();
});
