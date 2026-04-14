/// src/app/router/RoleRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ReactNode } from "react";
import type { Role } from "@/features/auth/types/auth";

interface Props {
  children: ReactNode;
  allowedRole: Role;
}

export const RoleRoute = ({ children, allowedRole }: Props) => {
  const { auth } = useAuth();

  // 🔐 Primero validar autenticación
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 Luego validar rol
  if (auth.user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};