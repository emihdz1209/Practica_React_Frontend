import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getTaskPriorities, createTaskPriority } from "../services/taskPriorityService"
import type { CreateTaskPriorityRequest } from "../types/taskPriority"

export const useTaskPriorities = () => {
  return useQuery({
    queryKey: ["taskPriorities"],
    queryFn: getTaskPriorities
  })
}

export const useCreateTaskPriority = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskPriorityRequest) => createTaskPriority(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskPriorities"] })
    }
  })
}