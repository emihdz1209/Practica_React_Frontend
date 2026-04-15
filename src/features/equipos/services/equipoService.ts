import { apiClient } from "@/shared/api/apiClient";
import type { Equipo, CreateEquipoRequest } from "@/features/equipos/types/equipo";

export const getEquipos = async (): Promise<Equipo[]> => {
  const response = await apiClient.get<Equipo[]>("/api/teams");
  return response.data;
};

export const createEquipo = async (equipo: CreateEquipoRequest): Promise<Equipo> => {
  const response = await apiClient.post<Equipo>("/api/teams", equipo);
  return response.data;
};
