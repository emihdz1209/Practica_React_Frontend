/// src/app/router/AppRouter.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ROUTES } from "./routes";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { CreateUserPage } from "@/features/users/pages/CreateUserPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";

import { ProtectedRoute } from "./ProtectedRoute";

import { NotFoundPage } from "@/shared/pages/NotFoundPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Login */}
        <Route path={ROUTES.login} element={<LoginPage />} />

        {/* 🔐 Dashboard (landing real) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 🔐 Users */}
        <Route
          path={ROUTES.users}
          element={
            <ProtectedRoute>
              <CreateUserPage />
            </ProtectedRoute>
          }
        />

        {/* ❌ Not found */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
};