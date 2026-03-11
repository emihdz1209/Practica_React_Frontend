/// src/app/router/ProtectedRoute.tsx
import type { ReactNode } from "react";

/*
Esta es la protección real, se pondrá por lo pronto un bypass de seguridad.

Cuando el sistema tenga autenticación implementada, reemplazar el contenido
del componente con esta versión:

import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

export const ProtectedRoute = ({ children }: Props) => {
  const { auth } = useAuth();

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
*/

interface Props {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  // BYPASS TEMPORAL PARA DESARROLLO
  // Permite acceder a todas las rutas mientras se desarrolla el sistema
  // sin tener aún autenticación implementada.

  return children;
};