/// src/app/router/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ROUTES } from "./routes";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { CreateUserPage } from "@/features/users/pages/CreateUserPage";

import { ProtectedRoute } from "./ProtectedRoute";

import { NotFoundPage } from "@/shared/pages/NotFoundPage";

import { CreateTaskPriorityPage } from "@/features/taskPriorities/pages/CreateTaskPriorityPage";



export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path={ROUTES.login} element={<LoginPage />} />

        <Route
          path={ROUTES.users}
          element={
            <ProtectedRoute>
              <CreateUserPage />
            </ProtectedRoute>
          }
        />

        <Route
            path={ROUTES.priorities}
            element={
                <ProtectedRoute>
                <CreateTaskPriorityPage />
                </ProtectedRoute>
            }
        />

        <Route path="/" element={<LoginPage />} />

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
};