/// src/app/router/AppRouter.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ROUTES } from "./routes";

import { LoginPage }          from "@/features/auth/pages/LoginPage";
import { DashboardPage }      from "@/features/dashboard/pages/DashboardPage";
import { CreateUserPage }     from "@/features/users/pages/CreateUserPage";
import { EquiposPage }        from "@/features/equipos/pages/EquiposPage";
import { ProyectosPage }      from "@/features/proyectos/pages/ProyectosPage";
import { TareasPage }         from "@/features/tareas/pages/TareasPage";
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

        {/* 🔐 Equipos */}
        <Route
          path={ROUTES.equipos}
          element={<ProtectedRoute><EquiposPage /></ProtectedRoute>}
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
