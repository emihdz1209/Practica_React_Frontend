import { apiClient } from "@/shared/api/apiClient";
import type { Tarea, CreateTareaRequest, UpdateTareaRequest } from "@/features/tareas/types/tarea";

export const getTareasByProyecto = async (projectId: string): Promise<Tarea[]> => {
  const response = await apiClient.get<Tarea[]>(`/api/projects/${projectId}/tasks`);
  return response.data;
};

export const createTarea = async (
  projectId: string,
  tarea: CreateTareaRequest
): Promise<Tarea> => {
  const response = await apiClient.post<Tarea>(
    `/api/projects/${projectId}/tasks`,
    tarea
  );
  return response.data;
};

export const updateTarea = async (
  taskId: string,
  data: UpdateTareaRequest
): Promise<Tarea> => {
  const response = await apiClient.put<Tarea>(`/api/tasks/${taskId}`, data);
  return response.data;
};

export const updateTareaStatus = async (
  taskId: string,
  estadoId: number
): Promise<void> => {
  await apiClient.patch(`/api/tasks/${taskId}/status`, null, {
    params: { estadoId },
  });
};

export const deleteTarea = async (taskId: string): Promise<void> => {
  await apiClient.delete(`/api/tasks/${taskId}`);
};
