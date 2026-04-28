import { apiClient } from "@/shared/api/apiClient";
import type {
  Tarea,
  TaskAssignment,
  CreateTareaRequest,
  UpdateTareaRequest,
} from "@/features/tareas/types/tarea";

const toRawId = (value: string) => value.replace(/-/g, "").toUpperCase();

const toHyphenatedId = (value: string) => {
  if (!value) return value;
  if (value.includes("-")) return value.toLowerCase();
  const clean = value.replace(/[^0-9a-fA-F]/g, "");
  if (clean.length !== 32) return value;
  return (
    clean.slice(0, 8) +
    "-" +
    clean.slice(8, 12) +
    "-" +
    clean.slice(12, 16) +
    "-" +
    clean.slice(16, 20) +
    "-" +
    clean.slice(20)
  ).toLowerCase();
};

const getTaskIdVariants = (taskId: string) => {
  const variants = new Set([taskId, toRawId(taskId), toHyphenatedId(taskId)]);
  return Array.from(variants).filter(Boolean);
};

const normalizePathIds = (taskId: string, userId: string) => ({
  taskId: toRawId(taskId),
  userId: toRawId(userId),
});

export const getTareasByProyecto = async (projectId: string): Promise<Tarea[]> => {
  const response = await apiClient.get<Tarea[]>(`/api/projects/${projectId}/tasks`);
  return response.data;
};

export const getTareaById = async (taskId: string): Promise<Tarea> => {
  const response = await apiClient.get<Tarea>(`/api/tasks/${taskId}`);
  return response.data;
};

export const getTaskUsers = async (taskId: string): Promise<TaskAssignment[]> => {
  const response = await apiClient.get<TaskAssignment[]>(`/api/tasks/${taskId}/users`);
  return response.data;
};

export const assignUserToTask = async (taskId: string, userId: string): Promise<void> => {
  try {
    await apiClient.post(`/api/tasks/${taskId}/users/${userId}`);
  } catch (error) {
    const normalizedIds = normalizePathIds(taskId, userId);

    if (normalizedIds.taskId === taskId && normalizedIds.userId === userId) {
      throw error;
    }

    await apiClient.post(`/api/tasks/${normalizedIds.taskId}/users/${normalizedIds.userId}`);
  }
};

export const removeUserFromTask = async (taskId: string, userId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/tasks/${taskId}/users/${userId}`);
  } catch (error) {
    const normalizedIds = normalizePathIds(taskId, userId);

    if (normalizedIds.taskId === taskId && normalizedIds.userId === userId) {
      throw error;
    }

    await apiClient.delete(`/api/tasks/${normalizedIds.taskId}/users/${normalizedIds.userId}`);
  }
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
  const variants = getTaskIdVariants(taskId);
  let lastError: unknown;

  for (const variant of variants) {
    try {
      await apiClient.delete(`/api/tasks/${variant}`);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};
