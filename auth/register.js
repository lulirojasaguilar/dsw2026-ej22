document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const errorEl = document.getElementById('register-error');
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggle-password');

    toggleButton.addEventListener('click', function() {
        const hidden = passwordInput.type === 'password';
        passwordInput.type = hidden ? 'text' : 'password';
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        errorEl.textContent = '';

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const repeated = document.getElementById('password2').value;

        // Mismas validaciones que el registro del backend
        if (!isValidEmail(email)) {
            errorEl.textContent = 'Ingresá un email válido.';
            return;
        }
        const passwordError = getPasswordError(password);
        if (passwordError) {
            errorEl.textContent = passwordError;
            return;
        }
        if (password !== repeated) {
            errorEl.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        try {
            await registerAdmin(email, password);
            sessionStorage.setItem('medportal_registered', email);
            window.location.href = 'login.html';
        } catch (error) {
            errorEl.textContent = error.message;
        }
    });
});
