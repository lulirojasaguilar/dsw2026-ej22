// Comportamiento común del panel (header, nav y cierre de sesión).
// Lo usan todas las páginas del administrador que comparten la grilla dashboard-container.

// RN05: solo el rol ADMINISTRADOR accede a las páginas administrativas
const session = getSession();
if (!session || session.role !== 'ADMINISTRADOR') {
  window.location.href = '../auth/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logout');
  const menuBtn = document.getElementById('menu-btn');
  const nav = document.getElementById('sidebar');

  logoutButton.addEventListener('click', () => {
    logout();
    window.location.href = '../auth/login.html';
  });

  // Ejercicio 22: en mobile el botón de menú abre y cierra el nav
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  const statSpecialties = document.getElementById('stat-specialties');
  if (statSpecialties) {
    loadStats(statSpecialties);
  }
});

async function loadStats(statSpecialties) {
  const { data } = await getSpecialties({ pageSize: 1000 });
  statSpecialties.textContent = data.filter((specialty) => specialty.active).length;
}
