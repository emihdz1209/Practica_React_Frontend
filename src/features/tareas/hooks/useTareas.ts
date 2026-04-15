import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTareasByProyecto,
  createTarea,
  updateTarea,
  updateTareaStatus,
  deleteTarea,
} from "@/features/tareas/services/tareaService";
import type { CreateTareaRequest, UpdateTareaRequest } from "@/features/tareas/types/tarea";

export const useTareas = (projectId?: string) => {
  return useQuery({
    queryKey: ["tareas", projectId],
    queryFn: () => getTareasByProyecto(projectId!),
    enabled: !!projectId,
  });
};

export const useCreateTarea = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTareaRequest) => createTarea(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
    },
  });
};

export const useUpdateTarea = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTareaRequest }) =>
      updateTarea(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
    },
  });
};

export const useUpdateTareaStatus = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, estadoId }: { taskId: string; estadoId: number }) =>
      updateTareaStatus(taskId, estadoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
    },
  });
};

export const useDeleteTarea = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTarea(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
    },
  });
};
