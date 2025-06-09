document.addEventListener('DOMContentLoaded', () => {
    const membershipForm = document.getElementById('membershipForm');
    const formMessage = document.getElementById('form-message');

    membershipForm.addEventListener('submit', (event) => {
        // Prevent the form from submitting the default way
        event.preventDefault();

        // --- Get form inputs ---
        const planInput = document.getElementById('membership-plan');
        const phoneInput = document.getElementById('telephone-number');
        const addressInput = document.getElementById('address');
        const monthInput = document.getElementById('month-amount');

        // --- Get form values ---
        const plan = planInput.value;
        const phone = phoneInput.value;
        const address = addressInput.value;
        const months = parseInt(monthInput.value, 10);

        // --- VALIDATION LOGIC ---
        if (!plan) {
            alert('Error: Please select a membership plan.');
            return;
        }

        if (!/^\d*$/.test(phone) || phone.length > 16) {
            alert('Error: Telephone must contain only numbers and be 16 digits or less.');
            return;
        }
        
        if (address.length > 256) {
            alert('Error: Address must be 256 characters or less.');
            return;
        }
        
        if (isNaN(months) || months < 1 || months > 60) {
            alert('Error: Month amount must be a number between 1 and 60.');
            return;
        }

        // If all validation passes, proceed
        formMessage.textContent = 'Processing your request...';
        formMessage.style.color = 'blue';

        // --- SIMULATE POST TO BACKEND ---
        console.log("Preparing to send the following data to the database:");
        console.log({
            membership_type: plan,
            telephone: phone,
            alamat: address,
            month_amount: months,
            // start_date and expired_date would be calculated on the backend
        });

        // Simulate a network delay
        setTimeout(() => {
            // On success from the backend:
            alert(`Successfully activated ${plan.charAt(0).toUpperCase() + plan.slice(1)} membership for ${months} month(s)!`);
            formMessage.textContent = 'Activation successful! Redirecting...';
            formMessage.style.color = 'green';
            
            // Redirect to dashboard or profile after a short delay
            setTimeout(() => {
                window.location.href = '/dashboard/user';
            }, 1500);

        }, 2000);
    });
});
