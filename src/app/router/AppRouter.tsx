// src/app/router/AppRouter.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ROUTES } from "./routes";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CreateUserPage } from "@/features/users/pages/CreateUserPage";
import { EquiposPage } from "@/features/equipos/pages/EquiposPage";
import { EquipoDetailPage } from "@/features/equipos/pages/EquipoDetailPage"; // 🔹 NUEVO
import { ProyectosPage } from "@/features/proyectos/pages/ProyectosPage";
import { ProyectoDashboardPage } from "@/features/proyectos/pages/ProyectoDashboardPage";
import { TareasPage } from "@/features/tareas/pages/TareasPage";
import { CreateTaskPriorityPage } from "@/features/taskPriorities/taskPriorities/pages/CreateTaskPriorityPage";

import { ProtectedRoute } from "./ProtectedRoute";
import { NotFoundPage }   from "@/shared/pages/NotFoundPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Login */}
        <Route path={ROUTES.login} element={<LoginPage />} />

        {/* 🔐 Dashboard */}
        <Route
          path={ROUTES.dashboard}
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        
        {/* 🔐 Tareas */}
        <Route
          path={ROUTES.tareas}
          element={<ProtectedRoute><TareasPage /></ProtectedRoute>}
        />

        {/* 🔐 Proyectos */}
        <Route
          path={ROUTES.proyectos}
          element={<ProtectedRoute><ProyectosPage /></ProtectedRoute>}
        />

        <Route
          path={ROUTES.proyectoDashboard}
          element={<ProtectedRoute><ProyectoDashboardPage /></ProtectedRoute>}
        />

        {/* 🔐 Equipos */}
        <Route
          path={ROUTES.equipos}
          element={<ProtectedRoute><EquiposPage /></ProtectedRoute>}
        />

        {/* 🔥 NUEVO: Detalle de equipo */}
        <Route
          path="/equipos/:teamId"
          element={
            <ProtectedRoute>
              <EquipoDetailPage />
            </ProtectedRoute>
          }
        />

        {/* 🔐 Users */}
        <Route
          path={ROUTES.users}
          element={<ProtectedRoute><CreateUserPage /></ProtectedRoute>}
        />

        {/* 🔐 Priorities */}
        <Route
          path={ROUTES.priorities}
          element={<ProtectedRoute><CreateTaskPriorityPage /></ProtectedRoute>}
        />

        {/* ❌ Not found */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
};