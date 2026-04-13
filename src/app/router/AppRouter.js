import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import PrivateRoute from './PrivateRoute';
import LoginPage from '../../features/auth/pages/LoginPage';
import TareasPage from '../../features/tareas/pages/TareasPage';
import CreateUserPage from '../../features/users/pages/CreateUserPage';
import ProyectosPage from '../../features/proyectos/pages/ProyectosPage';
import EquiposPage from '../../features/equipos/pages/EquiposPage';
import DashboardPage from '../../shared/pages/DashboardPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.login} element={<LoginPage />} />

        {/* Protected */}
        <Route path={ROUTES.home}      element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path={ROUTES.tareas}    element={<PrivateRoute><TareasPage /></PrivateRoute>} />
        <Route path={ROUTES.users}     element={<PrivateRoute><CreateUserPage /></PrivateRoute>} />
        <Route path={ROUTES.proyectos} element={<PrivateRoute><ProyectosPage /></PrivateRoute>} />
        <Route path={ROUTES.equipos}   element={<PrivateRoute><EquiposPage /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
