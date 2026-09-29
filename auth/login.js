document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const errorEl = document.getElementById('login-error');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggle-password');

    // Al volver del registro se muestra el aviso y se completa el email
    const registeredEmail = sessionStorage.getItem('medportal_registered');
    if (registeredEmail) {
        sessionStorage.removeItem('medportal_registered');
        document.getElementById('login-message').textContent = 'Administrador registrado. Ya podés iniciar sesión.';
        emailInput.value = registeredEmail;
    }

    toggleButton.addEventListener('click', function() {
        const hidden = passwordInput.type === 'password';
        passwordInput.type = hidden ? 'text' : 'password';
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        errorEl.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validaciones del backend: email obligatorio y válido, password de al menos 8 caracteres
        if (!isValidEmail(email)) {
            errorEl.textContent = 'Ingresá un email válido.';
            return;
        }
        if (password.length < 8) {
            errorEl.textContent = 'La contraseña debe tener al menos 8 caracteres.';
            return;
        }

        try {
            await loginAdmin(email, password);
            window.location.href = '../dashboard/dashboard.html';
        } catch (error) {
            errorEl.textContent = error.message;
        }
    });
});
