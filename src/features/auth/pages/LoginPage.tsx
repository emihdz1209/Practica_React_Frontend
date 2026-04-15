import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "@/app/router/routes";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { auth, login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.token) {
      navigate("/", { replace: true });
    }
  }, [auth.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    setError("");
    try {
      const data = await authService.login(form);
      login(data);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          <div className="auth-logo">
            <span className="auth-logo-icon">&#10003;</span>
            <span className="auth-logo-text">Task Manager</span>
          </div>
          <p className="auth-tagline">
            Organiza tareas, coordina equipos y<br />
            entrega proyectos a tiempo.
          </p>
          <div className="auth-brand-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          {/* Heading */}
          <div className="auth-heading">
            <h2>Bienvenido de vuelta</h2>
            <p className="page-subtitle">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="auth-banner auth-banner--error">{error}</div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="modal-form auth-form">
            <TextField
              name="email"
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              size="small"
              fullWidth
              autoComplete="email"
            />
            <TextField
              name="password"
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              size="small"
              fullWidth
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
              {loading ? (
                <CircularProgress size={18} style={{ color: "#fff" }} />
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
