import axios from 'axios';

// Auth endpoints live at /auth/... (no /api prefix)
const authClient = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
});

// ── Mock responses ────────────────────────────────────────────────
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const MOCK_USERS = [
  {
    userId: 'mock-1',
    email: 'admin@tec.mx',
    password: 'Admin123',
    primerNombre: 'Admin',
    apellido: 'Demo',
    rolId: 1,
  },
  {
    userId: 'mock-2',
    email: 'user@tec.mx',
    password: 'Admin123',
    primerNombre: 'Usuario',
    apellido: 'Demo',
    rolId: 2,
  },
];

let mockUsersStore = [...MOCK_USERS];

const mockLogin = async (email, password) => {
  await delay();
  const found = mockUsersStore.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) throw new Error('Credenciales incorrectas');
  return {
    token: `mock-jwt-token-${found.userId}`,
    userId: found.userId,
    email: found.email,
    rolId: found.rolId,
  };
};

const mockRegister = async (body) => {
  await delay();
  const exists = mockUsersStore.find(
    (u) => u.email.toLowerCase() === body.email.toLowerCase()
  );
  if (exists) throw new Error('El correo ya está registrado');
  mockUsersStore.push({ ...body, userId: `mock-${Date.now()}` });
  return {};
};

// ── Public API ─────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    if (process.env.REACT_APP_MOCK === 'true') {
      return mockLogin(email, password);
    }
    const { data } = await authClient.post('auth/login', { email, password });
    return data;
  },

  register: async (body) => {
    if (process.env.REACT_APP_MOCK === 'true') {
      return mockRegister(body);
    }
    await authClient.post('auth/register', body);
  },
};
