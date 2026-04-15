/// src/app/router/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { auth } = useAuth();

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};