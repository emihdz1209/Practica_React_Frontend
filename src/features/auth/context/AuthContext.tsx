import { createContext, useState } from "react";
import type { ReactNode } from "react";

import type { AuthState, AuthUser } from "@/features/auth/types/auth";

interface AuthContextType {
  auth: AuthState;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
  });

  const login = (user: AuthUser, token: string) => {
    setAuth({ user, token });
  };

  const logout = () => {
    setAuth({ user: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};