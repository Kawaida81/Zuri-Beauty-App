// Initialize Supabase client
const supabaseUrl = 'https://fnvptqomjnlftzpybomb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudnB0cW9tam5sZnR6cHlib21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMjc1MzQsImV4cCI6MjA1MzgwMzUzNH0.0xxoo3Epc49roIrqhVt21Zum1LbfBh8XONI4Lwjcu2I'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Test Supabase connection
async function testConnection() {
    try {
        // First test auth connection
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
            console.error('Supabase auth connection error:', authError.message);
            return;
        }

        console.log('Successfully connected to Supabase Auth!');

        // Then test database connection with a simpler query
        const { data, error } = await supabase
            .schema('Beauty')
            .from('profiles')
            .select('id, full_name, email, role')
            .limit(1);
            
        if (error) {
            console.error('Supabase database connection error:', error.message);
            alert('Failed to connect to Supabase. Check console for details.');
        } else {
            console.log('Successfully connected to Supabase Database!');
            console.log('Connection test result:', data);
        }
    } catch (err) {
        console.error('Error testing connection:', err.message);
        alert('Error testing Supabase connection. Check console for details.');
    }
}

// Call test connection when page loads
document.addEventListener('DOMContentLoaded', testConnection);

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.querySelector('input[type="password"]');
    const toggleButton = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.innerHTML = '👁️‍🗨️';
    } else {
        passwordInput.type = 'password';
        toggleButton.innerHTML = '👁️';
    }
}

// Handle sign up
if (document.getElementById('signupForm')) {
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Sign up the user
            const { data: { user }, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            alert('Sign up successful! Please check your email for verification.');
            window.location.href = 'login.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// Handle login
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Sign in the user
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Get user's profile including role
            const { data: profile, error: profileError } = await supabase
                .schema('Beauty')
                .from('profiles')
                .select('id, full_name, email, role')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            if (!profile) {
                throw new Error('Profile not found');
            }

            // Check if email is verified
            if (!user.email_confirmed_at) {
                alert('Please verify your email before logging in.');
                return;
            }

            // Redirect based on role
            switch (profile.role) {
                case 'client':
                    window.location.href = 'client/dashboard.html';
                    break;
                case 'worker':
                    window.location.href = 'worker/dashboard.html';
                    break;
                case 'admin':
                    window.location.href = 'admin/dashboard.html';
                    break;
                default:
                    throw new Error('Invalid role');
            }
        } catch (error) {
            alert(error.message);
        }
    });
}

// Check authentication state
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        console.error('Error checking auth status:', error.message);
        return;
    }
    
    if (session) {
        // Get user's profile
        const { data: profile, error: profileError } = await supabase
            .schema('Beauty')
            .from('profiles')
            .select('id, full_name, email, role')
            .eq('id', session.user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError.message);
            return;
        }

        if (!profile) {
            console.error('Profile not found');
            return;
        }

        // Redirect if on auth pages
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('signup.html')) {
            switch (profile.role) {
                case 'client':
                    window.location.href = 'client/dashboard.html';
                    break;
                case 'worker':
                    window.location.href = 'worker/dashboard.html';
                    break;
                case 'admin':
                    window.location.href = 'admin/dashboard.html';
                    break;
            }
        }
    } else {
        // If not authenticated and trying to access protected pages
        if (window.location.pathname.includes('/client/') || 
            window.location.pathname.includes('/worker/') || 
            window.location.pathname.includes('/admin/')) {
            window.location.href = '/login.html';
        }
    }
}

// Call checkAuth when page loads
document.addEventListener('DOMContentLoaded', checkAuth); 