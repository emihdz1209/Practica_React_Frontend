// src/app/router/AppRouter.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ROUTES } from "./routes";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { EquiposPage } from "@/features/equipos/pages/EquiposPage";
import { EquipoDetailPage } from "@/features/equipos/pages/EquipoDetailPage";
import { ProyectosPage } from "@/features/proyectos/pages/ProyectosPage";
import { ProyectoDashboardPage } from "@/features/proyectos/pages/ProyectoDashboardPage";
import { TareasPage } from "@/features/tareas/pages/TareasPage";
import { AgentPage } from "@/features/agent/pages/AgentPage";
import { AgentBacklogPage } from "@/features/agent/pages/AgentBacklogPage";
import { AgentDuplicateDetectionPage } from "@/features/agent/pages/AgentDuplicateDetectionPage";
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

        {/* 🔐 Agent */}
        <Route
          path={ROUTES.agent}
          element={<ProtectedRoute><AgentPage /></ProtectedRoute>}
        />

        <Route
          path={`${ROUTES.agentBacklog}/:projectId`}
          element={<ProtectedRoute><AgentBacklogPage /></ProtectedRoute>}
        />

        <Route
          path={`${ROUTES.agentDuplicateAnalysis}/:projectId`}
          element={<ProtectedRoute><AgentDuplicateDetectionPage /></ProtectedRoute>}
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