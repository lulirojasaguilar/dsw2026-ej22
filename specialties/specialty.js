document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const nameInput = document.getElementById('name');
  const descriptionInput = document.getElementById('description');
  const statusSelect = document.getElementById('status');
  const formError = document.getElementById('form-error');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.querySelectorAll('.error').forEach((el) => { el.textContent = ''; });

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const active = statusSelect.value === 'true';

    // Validaciones
    let hasError = false;
    if (name.length < 3 || name.length > 100) {
      document.getElementById('name-error').textContent = 'El nombre debe tener entre 3 y 100 caracteres.';
      hasError = true;
    }
    if (description.length < 10 || description.length > 100) {
      document.getElementById('description-error').textContent = 'La descripción debe tener entre 10 y 100 caracteres.';
      hasError = true;
    }
    if (hasError) return;

    // Guardar (ejercicio 24)
    try {
      const specialty = await createSpecialty({ name, description, active });
      console.log(specialty);
      window.location.href = 'specialties.html';
    } catch (error) {
      formError.textContent = error.message;
    }
  });
});
