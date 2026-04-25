/// src/features/proyectos/services/proyectoService.ts

import { apiClient } from "@/shared/api/apiClient";
import type {
  Proyecto,
  CreateProyectoRequest,
  Sprint,
  SprintKpis,
  DeveloperPerformance,
  ProjectProgress,
} from "@/features/proyectos/types/proyecto";

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

export interface ProjectMember {
  projectId: string;
  userId: string;
}

export const updateProyecto = async (
  projectId: string,
  proyecto: CreateProyectoRequest
): Promise<Proyecto> => {
  const response = await apiClient.put<Proyecto>(`/api/projects/${projectId}`, proyecto);
  return response.data;
};

export const deleteProyecto = async (projectId: string, teamId?: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/projects/${projectId}`);
    return;
  } catch (error: unknown) {
    if (!teamId) {
      throw error;
    }
  }

  // Fallback for APIs that scope project deletion under team routes.
  await apiClient.delete(`/api/teams/${teamId}/projects/${projectId}`);
};

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const response = await apiClient.get<ProjectMember[]>(`/api/projects/${projectId}/members`);
  return response.data;
};

export const deleteProjectMember = async (projectId: string, userId: string): Promise<void> => {
  await apiClient.delete(`/api/projects/${projectId}/members/${userId}`);
};

export const getProjectSprints = async (projectId: string): Promise<Sprint[]> => {
  const response = await apiClient.get<Sprint[]>(`/api/projects/${projectId}/sprints`);
  return response.data;
};

export const getSprintKpis = async (sprintId: string): Promise<SprintKpis> => {
  const response = await apiClient.get<SprintKpis>(`/api/sprints/${sprintId}/kpis`);
  return response.data;
};

export const getProjectProgress = async (projectId: string): Promise<ProjectProgress> => {
  const response = await apiClient.get<ProjectProgress>(`/api/projects/${projectId}/progress`);
  return response.data;
};

export const getDeveloperPerformance = async (
  projectId: string
): Promise<DeveloperPerformance[]> => {
  const response = await apiClient.get<DeveloperPerformance[]>(
    `/api/projects/${projectId}/developers/performance`
  );
  return response.data;
};