/// src/features/dashboard/pages/DashboardPage.tsx

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const DashboardPage = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Bienvenido: {auth.user?.email}</p>
      <p>Rol: {auth.user?.role}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};