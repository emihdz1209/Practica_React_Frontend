import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTareasByProyecto,
  getTareaById,
  getTaskUsers,
  assignUserToTask,
  removeUserFromTask,
  createTarea,
  updateTarea,
  updateTareaStatus,
  deleteTarea,
} from "@/features/tareas/services/tareaService";
import type { CreateTareaRequest, Tarea, UpdateTareaRequest } from "@/features/tareas/types/tarea";

export const useTareas = (projectId?: string) => {
  return useQuery({
    queryKey: ["tareas", projectId],
    queryFn: () => getTareasByProyecto(projectId!),
    enabled: !!projectId,
  });
};

export const useMultiProjectTareas = (projectIds: string[]) => {
  const queries = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: ["tareas", pid],
      queryFn: () => getTareasByProyecto(pid),
      enabled: !!pid,
    })),
  });

  const data: Tarea[] = [];
  queries.forEach((q) => {
    if (q.data) data.push(...q.data);
  });

  const isLoading = queries.some((q) => q.isLoading);

  return { data, isLoading };
};

export const useTareaById = (taskId?: string) => {
  return useQuery({
    queryKey: ["tarea", taskId],
    queryFn: () => getTareaById(taskId!),
    enabled: !!taskId,
  });
};

export const useTaskUsers = (taskId?: string) => {
  return useQuery({
    queryKey: ["taskUsers", taskId],
    queryFn: () => getTaskUsers(taskId!),
    enabled: !!taskId,
  });
};

export const useCreateTarea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateTareaRequest }) =>
      createTarea(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
    },
  });
};

export const useUpdateTarea = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTareaRequest }) =>
      updateTarea(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
      }
    },
  });
};

export const useUpdateTareaStatus = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, estadoId }: { taskId: string; estadoId: number }) =>
      updateTareaStatus(taskId, estadoId),
    onSuccess: (_, { taskId, estadoId }) => {
      if (projectId) {
        queryClient.setQueryData<Tarea[]>(["tareas", projectId], (current) => {
          if (!current) {
            return current;
          }

          return current.map((task) =>
            task.taskId === taskId
              ? {
                  ...task,
                  estadoId,
                }
              : task
          );
        });
      }

      queryClient.setQueryData<Tarea>(["tarea", taskId], (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          estadoId,
        };
      });

      queryClient.invalidateQueries({ queryKey: ["tareas"] });
      queryClient.invalidateQueries({ queryKey: ["tarea", taskId] });

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
      }
    },
  });
};

export const useDeleteTarea = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTarea(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
      }
    },
  });
};

export const useAssignTaskUser = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      assignUserToTask(taskId, userId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["taskUsers", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tarea", taskId] });

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
      }
    },
  });
};

export const useRemoveTaskUser = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      removeUserFromTask(taskId, userId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["taskUsers", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tarea", taskId] });

      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["tareas", projectId] });
      }
    },
  });
};
