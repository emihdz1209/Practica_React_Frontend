import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../../../app/router/routes';

const ROLES = [
  { rolId: 1, label: 'Administrador' },
  { rolId: 2, label: 'Desarrollador' },
];

const EMPTY_LOGIN = { email: '', password: '' };
const EMPTY_REGISTER = {
  primerNombre: '', apellido: '', email: '', password: '',
  telefono: '', telegramId: '', rolId: 2, managerEmail: '',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [tab,     setTab]     = useState('login'); // 'login' | 'register'
  const [form,    setForm]    = useState(EMPTY_LOGIN);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleTab = (t) => {
    setTab(t);
    setError('');
    setSuccess('');
    setForm(t === 'login' ? EMPTY_LOGIN : EMPTY_REGISTER);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(form.email, form.password);
      login(data);
      navigate(ROUTES.home, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { primerNombre, apellido, email, password, telegramId } = form;
    if (!primerNombre || !apellido || !email || !password || !telegramId) return;
    setLoading(true);
    setError('');
    try {
      await authService.register({ ...form, rolId: Number(form.rolId) });
      setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      setTimeout(() => handleTab('login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <span className="auth-logo-icon">✓</span>
            <span className="auth-logo-text">Task Manager</span>
          </div>
          <p className="auth-tagline">
            Organiza tareas, coordina equipos y<br />entrega proyectos a tiempo.
          </p>
          <div className="auth-brand-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-card">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => handleTab('login')}
              type="button"
            >
              Iniciar sesión
            </button>
            <button
              className={`auth-tab${tab === 'register' ? ' active' : ''}`}
              onClick={() => handleTab('register')}
              type="button"
            >
              Registrarse
            </button>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h2>{tab === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}</h2>
            <p className="page-subtitle">
              {tab === 'login'
                ? 'Ingresa tus credenciales para continuar'
                : 'Completa el formulario para registrarte'}
            </p>
          </div>

          {/* Error / Success banners */}
          {error   && <div className="auth-banner auth-banner--error">{error}</div>}
          {success && <div className="auth-banner auth-banner--success">{success}</div>}

          {/* ── Login form ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="modal-form auth-form">
              <TextField
                name="email" label="Correo electrónico" type="email"
                value={form.email} onChange={handleChange}
                required size="small" fullWidth
                autoComplete="email"
              />
              <TextField
                name="password" label="Contraseña" type="password"
                value={form.password} onChange={handleChange}
                required size="small" fullWidth
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                className="AddButton"
                disabled={loading}
                fullWidth
                style={{ marginTop: 4 }}
              >
                {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Iniciar sesión'}
              </Button>
            </form>
          )}

          {/* ── Register form ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="modal-form auth-form">
              <div className="modal-form-row">
                <TextField
                  name="primerNombre" label="Nombre"
                  value={form.primerNombre} onChange={handleChange}
                  required size="small"
                />
                <TextField
                  name="apellido" label="Apellido"
                  value={form.apellido} onChange={handleChange}
                  required size="small"
                />
              </div>
              <TextField
                name="email" label="Correo electrónico" type="email"
                value={form.email} onChange={handleChange}
                required size="small" fullWidth
                autoComplete="email"
              />
              <TextField
                name="password" label="Contraseña" type="password"
                value={form.password} onChange={handleChange}
                required size="small" fullWidth
                autoComplete="new-password"
              />
              <div className="modal-form-row">
                <TextField
                  name="telefono" label="Teléfono"
                  value={form.telefono} onChange={handleChange}
                  size="small"
                />
                <TextField
                  name="telegramId" label="Telegram ID"
                  value={form.telegramId} onChange={handleChange}
                  required size="small"
                />
              </div>
              <FormControl size="small" fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select name="rolId" value={form.rolId} onChange={handleChange} label="Rol">
                  {ROLES.map((r) => (
                    <MenuItem key={r.rolId} value={r.rolId}>{r.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="managerEmail" label="Email del manager"
                value={form.managerEmail} onChange={handleChange}
                size="small" fullWidth type="email"
              />
              <Button
                type="submit"
                variant="contained"
                className="AddButton"
                disabled={loading}
                fullWidth
                style={{ marginTop: 4 }}
              >
                {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Crear cuenta'}
              </Button>
            </form>
          )}

          {/* Demo hint (mock mode only) */}
          {process.env.REACT_APP_MOCK === 'true' && tab === 'login' && (
            <p className="auth-hint">
              Demo: <strong>admin@tec.mx</strong> / <strong>Admin123</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
