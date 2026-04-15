import { apiClient } from "@/shared/api/apiClient"
import type { TaskPriority, CreateTaskPriorityRequest } from "../types/taskPriority"

export const getTaskPriorities = async (): Promise<TaskPriority[]> => {
  const response = await apiClient.get("/api/priorities")
  return response.data
}

export const createTaskPriority = async (
  data: CreateTaskPriorityRequest
): Promise<TaskPriority> => {
  const response = await apiClient.post("/api/priorities", data)
  return response.data
}