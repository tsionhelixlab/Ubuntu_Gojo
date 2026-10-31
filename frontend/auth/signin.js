
const form = document.getElementById('signinForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const toggle = document.getElementById('togglePassword');


const saved = localStorage.getItem('signupEmail');

if (saved) {
    emailInput.value = saved;
    localStorage.removeItem('signupEmail');
}

if (toggle) {
    toggle.addEventListener('click', () => {
        passwordInput.type =
            passwordInput.type === 'password' ? 'text' : 'password';

        toggle.textContent =
            passwordInput.type === 'password' ? '◉' : '◎';
    });
}

// Sign in
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value.trim(),
                password: passwordInput.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Login failed.');
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.role === 'admin') {
            window.location.href = '../admin/index.html';
        } else {
            window.location.href = '../student/Dashboard.html';
        }

    } catch (error) {
        console.error('Sign-in error:', error);
        alert('Unable to connect to Ubuntu Gojo.');
    }
});
