const PAGE_SIZE = 5;

// Íconos por especialidad (gana la primera que coincide)
const CATEGORY_ICONS = [
  { match: /cirug/i, icon: 'scissors' },
  { match: /cabeza|cuello/i, icon: 'person-bounding-box' },
  { match: /proctol/i, icon: 'bullseye' },
  { match: /flebol/i, icon: 'bezier2' },
  { match: /mastol/i, icon: 'suit-heart' },
  { match: /pie diab/i, icon: 'person-standing' },
  { match: /quemad|pl.stic/i, icon: 'fire' },
  { match: /cardio/i, icon: 'heart-pulse' },
  { match: /neuro/i, icon: 'activity' },
  { match: /dermat/i, icon: 'droplet' },
  { match: /pediatr|neonat/i, icon: 'emoji-smile' },
  { match: /oftalm/i, icon: 'eye' },
  { match: /otorrino/i, icon: 'ear' },
  { match: /neumo/i, icon: 'lungs' },
  { match: /odonto/i, icon: 'emoji-laughing' },
  { match: /gineco|obstetr/i, icon: 'gender-female' },
  { match: /urolog/i, icon: 'gender-male' },
  { match: /nefrol/i, icon: 'water' },
  { match: /traumat|ortoped/i, icon: 'bandaid' },
  { match: /psiqui|psicol/i, icon: 'chat-heart' },
  { match: /kinesiol|fisiatr|rehabilit/i, icon: 'person-walking' },
  { match: /geriatr/i, icon: 'person-wheelchair' },
  { match: /reumat/i, icon: 'person-arms-up' },
  { match: /hematol/i, icon: 'droplet-half' },
  { match: /hepat/i, icon: 'droplet-fill' },
  { match: /parasit|ponzo/i, icon: 'bug' },
  { match: /laboral|trabajo/i, icon: 'person-workspace' },
  { match: /oncol|radiol/i, icon: 'radioactive' },
  { match: /infecto/i, icon: 'virus' },
  { match: /alerg|inmun/i, icon: 'shield-check' },
  { match: /endocrin/i, icon: 'capsule' },
  { match: /gastro/i, icon: 'cup-hot' },
  { match: /nutri/i, icon: 'apple' },
  { match: /anestes/i, icon: 'capsule-pill' },
  { match: /farmacol/i, icon: 'prescription2' },
  { match: /emergenc|urgenc|guardia/i, icon: 'hospital' },
  { match: /cl.nic|general|familia/i, icon: 'clipboard2-pulse' },
];

let pageIndex = 0;
let searchName = '';

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchError = document.getElementById('search-error');

  // Buscador (ejercicio 23)
  document.getElementById('search-btn').addEventListener('click', () => {
    const term = searchInput.value.trim();
    if (term.length > 0 && term.length < 3) {
      searchError.textContent = 'Ingresá al menos 3 caracteres para buscar.';
      return;
    }
    searchError.textContent = '';
    searchName = term;
    pageIndex = 0;
    loadSpecialties();
  });

  // Paginado
  document.getElementById('prev-page').addEventListener('click', () => {
    pageIndex--;
    loadSpecialties();
  });

  document.getElementById('next-page').addEventListener('click', () => {
    pageIndex++;
    loadSpecialties();
  });

  loadSpecialties();
  loadStats();
});

async function loadSpecialties() {
  const page = await getSpecialties({ name: searchName, pageSize: PAGE_SIZE, pageIndex });
  renderTable(page.data);

  const from = page.total === 0 ? 0 : page.pageIndex * page.pageSize + 1;
  const to = page.pageIndex * page.pageSize + page.data.length;
  document.getElementById('page-info').textContent = `Mostrando ${from} a ${to} de ${page.total} resultados`;
  document.getElementById('prev-page').disabled = page.pageIndex === 0;
  document.getElementById('next-page').disabled = to >= page.total;
}

// Tabla
function renderTable(specialties) {
  const tbody = document.getElementById('specialty-table-body');
  tbody.innerHTML = '';

  if (specialties.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.className = 'empty';
    cell.textContent = 'No se encontraron especialidades.';
    return;
  }

  specialties.forEach((specialty) => {
    const row = tbody.insertRow();

    const category = CATEGORY_ICONS.find((entry) => entry.match.test(specialty.name));
    const nameCell = row.insertCell();
    nameCell.innerHTML = `<div class="specialty-name"><span class="chip"><i class="bi bi-${category ? category.icon : 'briefcase'}"></i></span></div>`;
    nameCell.firstChild.append(specialty.name);

    const descriptionCell = row.insertCell();
    descriptionCell.className = 'specialty-description';
    descriptionCell.textContent = specialty.description;

    const status = document.createElement('span');
    status.className = specialty.active ? 'status active' : 'status';
    status.textContent = specialty.active ? 'Activo' : 'Inactivo';
    row.insertCell().append(status);

    const actions = row.insertCell();
    actions.className = 'row-actions';
    actions.innerHTML = `
      <button disabled title="Próximamente"><i class="bi bi-pencil"></i></button>
      <button disabled title="Próximamente"><i class="bi bi-trash"></i></button>
    `;
  });
}

// Estadísticas
async function loadStats() {
  const { data, total } = await getSpecialties({ pageSize: 1000 });
  document.getElementById('stat-total').textContent = total;

  const now = new Date();
  const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const lastQuarter = data.filter((specialty) => new Date(specialty.createdAt) >= quarterAgo).length;
  document.getElementById('stat-total-note').textContent = `+${lastQuarter} este trimestre`;

  const newThisMonth = data.filter((specialty) => {
    const created = new Date(specialty.createdAt);
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
  });
  document.getElementById('stat-new').textContent = String(newThisMonth.length).padStart(2, '0');
  const names = newThisMonth.map((specialty) => specialty.name);
  document.getElementById('stat-new-note').textContent = names.length
    ? names.slice(0, 2).join(', ') + (names.length > 2 ? ', ...' : '')
    : 'Sin altas este mes';
}
