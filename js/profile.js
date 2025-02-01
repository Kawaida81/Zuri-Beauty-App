// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async function() {
    // Get DOM elements
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const profileName = document.getElementById('profileName');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Load profile information
    async function loadProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (profile) {
                    // Update profile name in header
                    profileName.textContent = profile.full_name;

                    // Fill form fields
                    document.getElementById('fullName').value = profile.full_name || '';
                    document.getElementById('email').value = user.email || '';
                    document.getElementById('phone').value = profile.phone || '';
                    document.getElementById('address').value = profile.address || '';
                    document.getElementById('preferences').value = profile.preferences || '';
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Failed to load profile information. Please try again.');
        }
    }

    // Update profile information
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const saveBtn = this.querySelector('.save-btn');
        const loadingSpinner = saveBtn.querySelector('.loading-spinner');

        try {
            saveBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const profileData = {
                id: user.id,
                full_name: document.getElementById('fullName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                preferences: document.getElementById('preferences').value.trim(),
                updated_at: new Date()
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(profileData);

            if (error) throw error;

            // Update profile name in header
            profileName.textContent = profileData.full_name;
            alert('Profile updated successfully!');

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            saveBtn.disabled = false;
            loadingSpinner.style.display = 'none';
        }
    });

    // Change password
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        const submitBtn = this.querySelector('.change-password-btn');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');

        try {
            submitBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            alert('Password updated successfully!');
            this.reset();

        } catch (error) {
            console.error('Error updating password:', error);
            alert('Failed to update password. Please try again.');
        } finally {
            submitBtn.disabled = false;
            loadingSpinner.style.display = 'none';
        }
    });

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type');
            input.setAttribute('type', type === 'password' ? 'text' : 'password');
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Initialize profile
    loadProfile();
}); 