/* Acceso a datos del front: todo se guarda en el navegador.
   Administradores y especialidades en localStorage, sesión en sessionStorage.
   Todas las páginas leen y escriben los datos a través de estas funciones,
   que aplican las mismas reglas que el backend del TPI. */

const ADMINS_KEY = 'medportal_admins';
const SPECIALTIES_KEY = 'medportal_specialties';
const SESSION_KEY = 'medportal_session';

// Administrador inicial (el mismo que crea el backend al arrancar)
const DEFAULT_ADMINS = [{ email: 'admin@dsw2026.com', password: 'Admin123!' }];

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- Validaciones compartidas ---------- */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Reglas de contraseña del backend: mínimo 8 caracteres, con mayúscula, minúscula y número
function getPasswordError(password) {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe tener al menos una mayúscula.';
  if (!/[a-z]/.test(password)) return 'La contraseña debe tener al menos una minúscula.';
  if (!/[0-9]/.test(password)) return 'La contraseña debe tener al menos un número.';
  return '';
}

/* ---------- Autenticación ---------- */

// El administrador inicial siempre existe, aunque ya haya admins guardados en el navegador
function readAdmins() {
  const saved = read(ADMINS_KEY, []);
  const missing = DEFAULT_ADMINS.filter((admin) =>
    !saved.find((item) => item.email.toLowerCase() === admin.email.toLowerCase()));
  return missing.concat(saved);
}

async function registerAdmin(email, password) {
  const admins = readAdmins();
  if (admins.some((admin) => admin.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Ya existe un administrador registrado con ese email.');
  }
  admins.push({ email, password });
  write(ADMINS_KEY, admins);
  return { email };
}

async function loginAdmin(email, password) {
  const admins = readAdmins();
  const admin = admins.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!admin || admin.password !== password) {
    throw new Error('Email o contraseña incorrectos.');
  }
  const session = { email: admin.email, role: 'ADMINISTRADOR' };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch (error) {
    return null;
  }
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

/* ---------- Especialidades ---------- */

function readSpecialties() {
  return read(SPECIALTIES_KEY, []);
}

// El nombre no se puede repetir entre especialidades no eliminadas
function ensureUniqueName(specialties, name) {
  const repeated = specialties.some((item) =>
    !item.deleted && item.name.toLowerCase() === name.toLowerCase());
  if (repeated) throw new Error('El nombre de la especialidad ya se encuentra registrado.');
}

// Listado paginado (pageIndex empieza en 0), ordenado por nombre y con filtro por nombre.
// No incluye eliminadas (deleted = true).
async function getSpecialties({ name = '', pageSize = 10, pageIndex = 0 } = {}) {
  const term = name.trim().toLowerCase();
  const filtered = readSpecialties()
    .filter((specialty) => !specialty.deleted)
    .filter((specialty) => !term || specialty.name.toLowerCase().includes(term))
    .sort((a, b) => a.name.localeCompare(b.name));

  const start = pageIndex * pageSize;
  return {
    pageSize,
    pageIndex,
    data: filtered.slice(start, start + pageSize),
    total: filtered.length
  };
}

async function createSpecialty({ name, description, active }) {
  const specialties = readSpecialties();
  ensureUniqueName(specialties, name);
  const specialty = {
    id: crypto.randomUUID(),
    name,
    description,
    active,
    deleted: false,
    createdAt: new Date().toISOString()
  };
  specialties.push(specialty);
  write(SPECIALTIES_KEY, specialties);
  return specialty;
}
