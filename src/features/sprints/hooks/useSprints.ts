import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSprint,
  deleteSprint,
  getSprintById,
  getSprintsByProject,
  updateSprint,
} from "@/features/sprints/services/sprintService";

import type {
  CreateSprintRequest,
  UpdateSprintRequest,
} from "@/features/sprints/types/sprint";

export const useSprintsByProject = (projectId?: string) => {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => getSprintsByProject(projectId as string),
    enabled: Boolean(projectId),
  });
};

export const useSprint = (sprintId?: string) => {
  return useQuery({
    queryKey: ["sprint", sprintId],
    queryFn: () => getSprintById(sprintId as string),
    enabled: Boolean(sprintId),
  });
};

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: CreateSprintRequest;
    }) => createSprint(projectId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["sprints", data.projectId],
      });
    },
  });
};

export const useUpdateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sprintId,
      payload,
    }: {
      sprintId: string;
      payload: UpdateSprintRequest;
    }) => updateSprint(sprintId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sprint", data.sprintId] });
      queryClient.invalidateQueries({
        queryKey: ["sprints", data.projectId],
      });
    },
  });
};

export const useDeleteSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      sprintId: string;
      projectId?: string;
    }) => deleteSprint(variables.sprintId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sprint", variables.sprintId],
      });

      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: ["sprints", variables.projectId],
        });
      }
    },
  });
};
