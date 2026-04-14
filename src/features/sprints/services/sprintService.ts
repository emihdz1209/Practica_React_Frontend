import apiClient from "@/shared/api/apiClient";

import type {
  CreateSprintRequest,
  Sprint,
  UpdateSprintRequest,
} from "@/features/sprints/types/sprint";

export const createSprint = async (
  projectId: string,
  payload: CreateSprintRequest
): Promise<Sprint> => {
  const response = await apiClient.post<Sprint>(
    `/api/projects/${projectId}/sprints`,
    payload
  );

  return response.data;
};

export const getSprintsByProject = async (projectId: string): Promise<Sprint[]> => {
  const response = await apiClient.get<Sprint[]>(`/api/projects/${projectId}/sprints`);
  return response.data;
};

export const getSprintById = async (sprintId: string): Promise<Sprint> => {
  const response = await apiClient.get<Sprint>(`/api/sprints/${sprintId}`);
  return response.data;
};

export const updateSprint = async (
  sprintId: string,
  payload: UpdateSprintRequest
): Promise<Sprint> => {
  const response = await apiClient.put<Sprint>(`/api/sprints/${sprintId}`, payload);
  return response.data;
};

export const deleteSprint = async (sprintId: string): Promise<void> => {
  await apiClient.delete(`/api/sprints/${sprintId}`);
};
