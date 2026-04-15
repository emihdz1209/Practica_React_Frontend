/// src/features/auth/context/AuthContext.tsx

import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

import type {
  AuthState,
  AuthUser,
  LoginResponse,
  Role,
} from "@/features/auth/types/auth";

interface AuthContextType {
  auth: AuthState;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

const mapRole = (rolId: number): Role => {
  switch (rolId) {
    case 1:
      return "MANAGER";
    case 2:
      return "DEVELOPER";
    default:
      return "DEVELOPER";
  }
};

export const AuthProvider = ({ children }: Props) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: localStorage.getItem(TOKEN_STORAGE_KEY),
  });

  // 🔄 Persistencia al recargar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setAuth({
        token,
        user: JSON.parse(user),
      });
    }
  }, []);

  const login = (data: LoginResponse) => {
    const user: AuthUser = {
      userId: data.userId,
      email: data.email,
      role: mapRole(data.rolId),
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(user));

    setAuth({
      token: data.token,
      user,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({ user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};