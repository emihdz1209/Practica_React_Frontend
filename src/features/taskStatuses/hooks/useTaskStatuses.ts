import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTaskStatus, getTaskStatuses } from "@/features/taskStatuses/services/taskStatusService";
import type { CreateTaskStatusRequest } from "@/features/taskStatuses/types/taskStatus";

export const useTaskStatuses = () => {
  return useQuery({
    queryKey: ["taskStatuses"],
    queryFn: getTaskStatuses,
  });
};

export const useCreateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskStatusRequest) => createTaskStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskStatuses"] });
    },
  });
};
