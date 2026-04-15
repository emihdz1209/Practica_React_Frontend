import { apiClient } from "@/shared/api/apiClient";
import type { TaskStatus, CreateTaskStatusRequest } from "@/features/taskStatuses/types/taskStatus";

export const getTaskStatuses = async (): Promise<TaskStatus[]> => {
  const response = await apiClient.get<TaskStatus[]>("/api/task-status");
  return response.data;
};

export const createTaskStatus = async (
  payload: CreateTaskStatusRequest
): Promise<TaskStatus> => {
  const response = await apiClient.post<TaskStatus>("/api/task-status", payload);
  return response.data;
};
