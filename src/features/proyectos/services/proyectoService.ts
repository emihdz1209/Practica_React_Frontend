import { apiClient } from "@/shared/api/apiClient";
import type { Proyecto, CreateProyectoRequest } from "@/features/proyectos/types/proyecto";

export const getProyectosByTeam = async (teamId: string): Promise<Proyecto[]> => {
  const response = await apiClient.get<Proyecto[]>(`/api/teams/${teamId}/projects`);
  return response.data;
};

export const createProyecto = async (
  teamId: string,
  proyecto: CreateProyectoRequest
): Promise<Proyecto> => {
  const response = await apiClient.post<Proyecto>(
    `/api/teams/${teamId}/projects`,
    proyecto
  );
  return response.data;
};

export const getProyecto = async (projectId: string): Promise<Proyecto> => {
  const response = await apiClient.get<Proyecto>(`/api/projects/${projectId}`);
  return response.data;
};
