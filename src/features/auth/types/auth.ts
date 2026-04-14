/// src/features/auth/types/auth.ts

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  rolId: number;
}

export type Role = "MANAGER" | "DEVELOPER";

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
}