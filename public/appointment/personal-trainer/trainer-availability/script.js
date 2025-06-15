import { tryFetchJson } from "../../../requestScript.js"; // Pastikan path ini benar

// --- FUNGSI BANTU & API ---

const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
}

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Invalid token:", e);
        return null;
    }
}

const getTrainerIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const trainerId = urlParams.get('id');
    return trainerId;
};


const getTrainerDetails = async (trainerId) => {
    return await tryFetchJson(`/personaltrainer/${trainerId}`, { method: 'GET' });
};

const getTrainerAvailability = async (trainerId, month, year) => {
    const req = { method: "GET" };
    return await tryFetchJson(`/personaltrainer/${trainerId}/availability?month=${month}&year=${year}`, req);
};

const purchaseAppointments = async (payload) => {
    const token = getCookie("token");
    if (!token) {
        alert("You must be logged in to book an appointment.");
        window.location.href = '/login';
        return;
    }
    const req = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    };
    return await tryFetchJson('/appointment/purchase', req);
};

// --- MAIN SCRIPT ---

document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const timeSlotPlaceholder = document.getElementById('time-slot-placeholder');
    const timeSlotsGrid = document.getElementById('time-slots-grid');
    const confirmBtn = document.getElementById('confirm-appointment-btn');

    // --- MANAJEMEN STATE ---
    const now = new Date();
    let currentDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let selectedDate = null;
    let selectedTimeSlots = []; 
    let selectedAvailabilityIds = []; 
    let monthlyAvailability = {};
    const trainerId = getTrainerIdFromUrl();

    const fetchAndDisplayTrainerInfo = async () => {
        const [_, trainer] = await getTrainerDetails(trainerId);
        const trainerName = trainer.data.name;
        document.getElementById('trainer-name').textContent = trainerName;
        document.getElementById('trainer-price').textContent = `Rp ${parseInt(trainer.data.price_per_hour)} / Month`;
        document.getElementById('modal-trainer-name').textContent = trainerName;
        const formattedName = trainerName.replace(/\s/g, '+');
        document.getElementById('trainer-image').src = `https://ui-avatars.com/api/?name=${formattedName}&background=0D8ABC&color=fff&size=128`;
        loader.classList.add('hidden');
        content.classList.remove('hidden');
    };

    const fetchMonthlyAvailability = async () => {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const [_, availabilityData] = await getTrainerAvailability(trainerId, month, year);
        monthlyAvailability = {};
        if (availabilityData.data) {
            availabilityData.data.forEach(item => {
                const day = new Date(item.at_date).getDate();
                if (item.map_time) {
                    monthlyAvailability[day] = item.map_time;
                }
            });
        }
        renderCalendar();
    };

    const renderCalendar = () => {
        calendarDaysGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        monthYearHeader.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDaysGrid.innerHTML += '<div></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayButton = document.createElement('button');
            const loopDate = new Date(year, month, day);
            dayButton.textContent = day;
            dayButton.dataset.day = day;
            dayButton.className = "p-2 rounded-full transition text-center";

            const isDateAvailable = monthlyAvailability[day] && monthlyAvailability[day].some(slotId => slotId !== null && slotId !== 'TAKEN');

            if (loopDate < today || !isDateAvailable) {
                dayButton.disabled = true;
                dayButton.classList.add('text-gray-300', 'cursor-not-allowed');
            } else {
                dayButton.classList.add('hover:bg-slate-100', 'cursor-pointer', 'font-semibold', 'text-sky-600', 'bg-sky-50');
            }

            if (selectedDate && loopDate.getTime() === selectedDate.getTime()) {
                dayButton.classList.add('bg-[#3490f3]', 'text-white');
                dayButton.classList.remove('hover:bg-slate-100', 'bg-sky-50');
            }
            calendarDaysGrid.appendChild(dayButton);
        }
    };

    const renderTimeSlots = (day) => {
        const timeSlotsMap = [];
        for (let hour = 8; hour < 22; hour++) {
            const start = hour.toString().padStart(2, '0') + ':00';
            const end = (hour + 1).toString().padStart(2, '0') + ':00';
            timeSlotsMap.push(`${start}-${end}`);
        }

        const dailySchedule = monthlyAvailability[day];
        timeSlotsGrid.innerHTML = '';

        selectedTimeSlots = [];
        selectedAvailabilityIds = [];
        confirmBtn.disabled = true;

        if (!dailySchedule) {
            timeSlotPlaceholder.textContent = "Tidak ada informasi jadwal untuk tanggal ini.";
            timeSlotPlaceholder.classList.remove('hidden');
            timeSlotsGrid.classList.add('hidden');
            return;
        }

        timeSlotsMap.forEach((slot, index) => {
            const slotValue = dailySchedule[index];
            const isAvailable = slotValue !== null && slotValue !== 'TAKEN';
            const slotButton = document.createElement('button');
            slotButton.textContent = slot.replace('-', ' - ');
            slotButton.dataset.slot = slot;
            if (isAvailable) {
                slotButton.dataset.availabilityId = slotValue;
                slotButton.disabled = false;
                slotButton.className = "time-slot p-2 border rounded-md text-sm hover:bg-slate-100 transition cursor-pointer";
            } else {
                slotButton.disabled = true;
                slotButton.className = "p-2 border rounded-md text-sm text-gray-400 bg-gray-100 cursor-not-allowed";
            }
            timeSlotsGrid.appendChild(slotButton);
        });

        timeSlotPlaceholder.classList.add('hidden');
        timeSlotsGrid.classList.remove('hidden');
    };

    const handleDateClick = (event) => {
        const target = event.target.closest('button');
        if (!target || !target.dataset.day || target.disabled) return;
        const day = parseInt(target.dataset.day);
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        renderCalendar();
        renderTimeSlots(day);
    };

    const handleTimeClick = (event) => {
        const target = event.target.closest('button');
        if (!target || !target.dataset.slot || target.disabled) return;

        const time = target.dataset.slot;
        const id = target.dataset.availabilityId;

        const isSelected = selectedAvailabilityIds.includes(id);

        if (isSelected) {
            target.classList.remove('bg-[#3490f3]', 'text-white');
            selectedAvailabilityIds = selectedAvailabilityIds.filter(selectedId => selectedId !== id);
            selectedTimeSlots = selectedTimeSlots.filter(selectedTime => selectedTime !== time);
        } else {
            target.classList.add('bg-[#3490f3]', 'text-white');
            selectedAvailabilityIds.push(id);
            selectedTimeSlots.push(time);
        }

        confirmBtn.disabled = selectedAvailabilityIds.length === 0;
    };

    const openConfirmModal = () => {
        if (!selectedDate || selectedAvailabilityIds.length === 0) return;

        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('modal-date').textContent = selectedDate.toLocaleDateString('en-GB', dateOptions);

        const timeText = selectedTimeSlots.sort().join(', ');
        document.getElementById('modal-time').textContent = `at ${timeText}`;

        const modalBackdrop = document.getElementById('confirm-modal-backdrop');
        const modal = document.getElementById('confirm-modal');
        modalBackdrop.classList.remove('hidden');
        setTimeout(() => {
            modalBackdrop.classList.remove('opacity-0');
            modal.classList.remove('scale-95', 'opacity-0');
        }, 10);
    };

    const closeConfirmModal = () => {
        const modalBackdrop = document.getElementById('confirm-modal-backdrop');
        const modal = document.getElementById('confirm-modal');
        modalBackdrop.classList.add('opacity-0');
        modal.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modalBackdrop.classList.add('hidden'), 300);
    };

    const handleConfirmBooking = async () => {
        const modalConfirmBtn = document.getElementById('modal-confirm-btn');
        modalConfirmBtn.disabled = true;
        modalConfirmBtn.textContent = 'Purchasing...';

        const isoDate = selectedDate.toISOString().split('T')[0];

        const payload = {
            pt_id: trainerId,
            date: isoDate,
            times: selectedAvailabilityIds,
        };

        const [res, result] = await purchaseAppointments(payload);

        console.log(res.status)
        if (res.status != 201) {
            alert(`Purchase failed: Please try again later.`);
            modalConfirmBtn.disabled = false;
            modalConfirmBtn.textContent = 'Book Session';
        } else {
            alert('Purchase successful! Check your receipt page for details.');
            window.location.href = '/receipt';
        }
    };

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        fetchMonthlyAvailability();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        fetchMonthlyAvailability();
    });

    calendarDaysGrid.addEventListener('click', handleDateClick);
    timeSlotsGrid.addEventListener('click', handleTimeClick);
    confirmBtn.addEventListener('click', openConfirmModal);
    document.getElementById('modal-close-btn').addEventListener('click', closeConfirmModal);
    document.getElementById('modal-confirm-btn').addEventListener('click', handleConfirmBooking);

    await fetchAndDisplayTrainerInfo();
    await fetchMonthlyAvailability();
});