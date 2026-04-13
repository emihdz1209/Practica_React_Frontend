import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { ROUTES } from './routes';

/**
 * Wraps a route element — redirects to /login if the user is not authenticated.
 * In mock mode the guard still applies so the login page can be demonstrated,
 * but the mock authService handles everything in-memory (no real backend needed).
 */
export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to={ROUTES.login} replace />;
}
