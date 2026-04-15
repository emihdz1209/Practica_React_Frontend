export interface CreateUserRequest {
  primerNombre: string;
  apellido: string;
  telefono: string;
  email: string;
  telegramId: string;
}

export interface CreateUserResponse {
  message: string;
  telegramId: string;
  email: string;
}

export interface User {
  userId: string;
  primerNombre: string;
  apellido: string;
  telefono: string;
  email: string;
  telegramId: string;
  rolId: number;
  estadoId: number;
  managerId: string | null;
}