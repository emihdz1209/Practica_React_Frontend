/// src/features/auth/pages/LoginPage.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { auth, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Solo para evitar ver login si ya estás logueado (ej: refresh)
  useEffect(() => {
    if (auth.token) {
      navigate("/", { replace: true });
    }
  }, [auth.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const data = await authService.login({ email, password });

      login(data);

      // 🔥 SOLO aquí navegamos
      navigate("/", { replace: true });

    } catch (err: any) {
      console.error(err);
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};