import { apiClient } from "@/shared/api/apiClient";


import type {
  CreateUserRequest,
  CreateUserResponse,
  User
} from "@/features/users/types/user";

export const createUser = async (
  user: CreateUserRequest
): Promise<CreateUserResponse> => {
  const response = await apiClient.post<CreateUserResponse>(
    "/api/users",
    user
  );

  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>("/api/users");
  return response.data;
};