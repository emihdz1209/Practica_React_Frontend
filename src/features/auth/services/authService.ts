/// src/features/auth/services/authService.ts

import { apiClient } from "@/shared/api/apiClient";
import type { LoginResponse } from "../types/auth";

interface LoginRequest {
  email: string;
  password: string;
}

export const authService = {
  async login({ email, password }: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    return data;
  },
};