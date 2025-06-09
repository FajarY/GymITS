document.addEventListener('DOMContentLoaded', () => {
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
    const now = new Date(2025, 5, 9, 15, 40, 0); 
    let currentDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start calendar on the 1st of the current month
    let selectedDate = null;
    let selectedTimeSlots = [];

    // --- TIME SLOTS DEFINITION ---
    const timeSlots = [
        '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
        '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00', 
        '21:00-22:00'
    ];

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
        timeSlots.forEach(slot => {
            const slotButton = document.createElement('button');
            slotButton.textContent = slot.replace('-', ' - ');
            slotButton.dataset.slot = slot;
            slotButton.className = "time-slot p-2 border rounded-md text-sm hover:bg-slate-100 transition";
            timeSlotsContainer.appendChild(slotButton);
        });
    }

    /**
     * Resets time slot selections
     */
    function resetTimeSlots() {
        selectedTimeSlots = [];
        document.querySelectorAll('.time-slot').forEach(btn => {
            btn.classList.remove('bg-[#3490f3]', 'text-white', 'border-transparent');
        });
    }
    
    /**
     * Formats date as YYYY-MM-DD for the database
     */
    function formatDateForDB(date) {
        return date.toISOString().split('T')[0];
    }
    
    // --- EVENT LISTENERS ---

    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
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
            resetTimeSlots();
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
            
            const slot = target.dataset.slot;
            if (selectedTimeSlots.includes(slot)) {
                selectedTimeSlots = selectedTimeSlots.filter(s => s !== slot);
            } else {
                selectedTimeSlots.push(slot);
            }
        }
    });

    // Save availability
    saveBtn.addEventListener('click', () => {
        if (!selectedDate || selectedTimeSlots.length === 0) {
            alert("Please select a date and at least one time slot.");
            return;
        }
        
        // Sort the slots to make range processing easier
        selectedTimeSlots.sort();
        
        const dateStr = formatDateForDB(selectedDate);
        const ranges = [];
        
        let start = null;
        let end = null;
        
        for (let i = 0; i < selectedTimeSlots.length; i++) {
            const [currentStart, currentEnd] = selectedTimeSlots[i].split('-');
            
            if (start === null) {
                // Start a new range
                start = currentStart;
                end = currentEnd;
            } else if (currentStart === end) {
                // Continue the current range
                end = currentEnd;
            } else {
                // The current range has ended, save it and start a new one
                ranges.push(`TSRANGE('[${dateStr} ${start}:00, ${dateStr} ${end}:00)')`);
                start = currentStart;
                end = currentEnd;
            }
        }
        
        // Save the last processed range
        if (start !== null) {
            ranges.push(`TSRANGE('[${dateStr} ${start}:00, ${dateStr} ${end}:00)')`);
        }

        // --- SIMULATE POST TO BACKEND ---
        console.log("Preparing to send the following data to the database:");
        console.log({
            date: dateStr,
            available_times: ranges
        });

        alert(`Availability for ${selectedDate.toLocaleDateString()} has been saved! Check the console for the data format.`);
        
        // Reset selections after saving
        resetTimeSlots();
    });

    // --- INITIAL RENDER ---
    renderCalendar();
    renderTimeSlots();
});
