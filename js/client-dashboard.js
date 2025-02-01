// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const appointmentForm = document.getElementById('appointmentForm');
    const serviceSelect = document.getElementById('service');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const appointmentsList = document.getElementById('appointmentsList');
    const clientNameSpan = document.getElementById('clientName');

    // Rating and feedback elements
    const stars = document.querySelectorAll('.stars i');
    const feedbackText = document.querySelector('.feedback-text');
    const submitFeedbackBtn = document.querySelector('.submit-feedback-btn');
    const loadingSpinner = document.querySelector('.loading-spinner');
    let selectedRating = 0;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Populate time slots based on business hours (9:00 AM - 5:00 PM)
    function populateTimeSlots() {
        timeSelect.innerHTML = '<option value="">Select a time...</option>';
        const startHour = 9;
        const endHour = 17;

        for (let hour = startHour; hour < endHour; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = `${timeString}`;
            timeSelect.appendChild(option);
        }
    }

    // Initialize time slots
    populateTimeSlots();

    // Load client information
    async function loadClientInfo() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    clientNameSpan.textContent = profile.full_name;
                }
            }
        } catch (error) {
            console.error('Error loading client info:', error);
        }
    }

    // Load appointments
    async function loadAppointments() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: appointments, error } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('client_id', user.id)
                    .order('date', { ascending: true });

                if (error) throw error;

                displayAppointments(appointments);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    }

    // Display appointments
    function displayAppointments(appointments) {
        if (!appointments || appointments.length === 0) {
            appointmentsList.innerHTML = '<p class="no-appointments">No appointments found</p>';
            return;
        }

        appointmentsList.innerHTML = appointments.map(appointment => `
            <div class="appointment-card">
                <h3>${appointment.service}</h3>
                <p>Date: ${new Date(appointment.date).toLocaleDateString()}</p>
                <p>Time: ${appointment.time}</p>
                <p>Status: ${appointment.status}</p>
                ${appointment.status === 'completed' ? `
                    <button onclick="showFeedbackForm('${appointment.id}')" class="feedback-btn">
                        Leave Feedback
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    // Book appointment
    appointmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const appointmentData = {
                client_id: user.id,
                service: serviceSelect.value,
                date: dateInput.value,
                time: timeSelect.value,
                status: 'pending'
            };

            const { error } = await supabase
                .from('appointments')
                .insert([appointmentData]);

            if (error) throw error;

            alert('Appointment booked successfully!');
            appointmentForm.reset();
            loadAppointments();

        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Failed to book appointment. Please try again.');
        }
    });

    // Star rating functionality
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = this.dataset.rating;
            updateStars(rating, 'hover');
        });

        star.addEventListener('mouseout', function() {
            updateStars(selectedRating, 'selected');
        });

        star.addEventListener('click', function() {
            selectedRating = this.dataset.rating;
            updateStars(selectedRating, 'selected');
        });
    });

    function updateStars(rating, action) {
        stars.forEach(star => {
            const starRating = star.dataset.rating;
            if (action === 'hover') {
                star.className = starRating <= rating ? 'fas fa-star' : 'far fa-star';
            } else if (action === 'selected') {
                star.className = starRating <= rating ? 'fas fa-star' : 'far fa-star';
            }
        });
    }

    // Show feedback form
    window.showFeedbackForm = function(appointmentId) {
        const feedbackSection = document.getElementById('feedbackSection');
        feedbackSection.style.display = 'block';
        feedbackSection.dataset.appointmentId = appointmentId;
    };

    // Submit feedback
    submitFeedbackBtn.addEventListener('click', async function() {
        if (!selectedRating) {
            alert('Please select a rating before submitting.');
            return;
        }

        const appointmentId = document.getElementById('feedbackSection').dataset.appointmentId;

        try {
            submitFeedbackBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';

            const { error } = await supabase
                .from('feedback')
                .insert([{
                    appointment_id: appointmentId,
                    rating: selectedRating,
                    comment: feedbackText.value.trim()
                }]);

            if (error) throw error;

            alert('Thank you for your feedback!');
            
            // Reset form
            selectedRating = 0;
            updateStars(0, 'selected');
            feedbackText.value = '';
            
            // Hide feedback section
            document.getElementById('feedbackSection').style.display = 'none';

        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            submitFeedbackBtn.disabled = false;
            loadingSpinner.style.display = 'none';
        }
    });

    // Sample notifications data
    const initialNotifications = [
        {
            id: 1,
            content: "Your appointment for Haircut has been confirmed",
            timestamp: "15 minutes ago",
            unread: true
        },
        {
            id: 2,
            content: "New service available: Spa Treatment",
            timestamp: "1 hour ago",
            unread: true
        },
        {
            id: 3,
            content: "Reminder: Your appointment tomorrow at 2 PM",
            timestamp: "3 hours ago",
            unread: false
        }
    ];

    // Notifications functionality
    const notificationsButton = document.getElementById('notificationsButton');
    const notificationsPopover = document.getElementById('notificationsPopover');
    const notificationsList = document.getElementById('notificationsList');
    const notificationsBadge = document.getElementById('notificationsBadge');
    const markAllReadBtn = document.getElementById('markAllRead');
    
    let notifications = [...initialNotifications];

    // Update notifications badge
    function updateBadge() {
        const unreadCount = notifications.filter(n => n.unread).length;
        notificationsBadge.textContent = unreadCount;
        notificationsBadge.style.display = unreadCount > 0 ? 'block' : 'none';
        markAllReadBtn.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    // Render notifications
    function renderNotifications() {
        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item" data-id="${notification.id}">
                <div class="notification-content">${notification.content}</div>
                <div class="notification-time">${notification.timestamp}</div>
                ${notification.unread ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');

        updateBadge();
    }

    // Toggle notifications popover
    notificationsButton.addEventListener('click', function(e) {
        e.stopPropagation();
        notificationsPopover.classList.toggle('show');
    });

    // Close popover when clicking outside
    document.addEventListener('click', function(e) {
        if (!notificationsPopover.contains(e.target) && !notificationsButton.contains(e.target)) {
            notificationsPopover.classList.remove('show');
        }
    });

    // Mark all as read
    markAllReadBtn.addEventListener('click', function() {
        notifications = notifications.map(notification => ({
            ...notification,
            unread: false
        }));
        renderNotifications();
    });

    // Handle notification click
    notificationsList.addEventListener('click', function(e) {
        const notificationItem = e.target.closest('.notification-item');
        if (notificationItem) {
            const id = parseInt(notificationItem.dataset.id);
            notifications = notifications.map(notification =>
                notification.id === id ? { ...notification, unread: false } : notification
            );
            renderNotifications();
        }
    });

    // Initial render
    renderNotifications();

    // Initialize dashboard
    loadClientInfo();
    loadAppointments();
}); 