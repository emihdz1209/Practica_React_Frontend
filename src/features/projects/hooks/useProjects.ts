import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addProjectMember,
  createProject,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjectProgress,
  getProjectsByTeam,
  removeProjectMember,
  updateProject,
} from "@/features/projects/services/projectService";

import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/features/projects/types/project";

export const useProjectsByTeam = (teamId?: string) => {
  return useQuery({
    queryKey: ["projects", teamId],
    queryFn: () => getProjectsByTeam(teamId as string),
    enabled: Boolean(teamId),
  });
};

export const useProject = (projectId?: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId as string),
    enabled: Boolean(projectId),
  });
};

export const useProjectProgress = (projectId?: string) => {
  return useQuery({
    queryKey: ["projectProgress", projectId],
    queryFn: () => getProjectProgress(projectId as string),
    enabled: Boolean(projectId),
  });
};

export const useProjectMembers = (projectId?: string) => {
  return useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => getProjectMembers(projectId as string),
    enabled: Boolean(projectId),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: string;
      payload: CreateProjectRequest;
    }) => createProject(teamId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects", data.teamId] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: UpdateProjectRequest;
    }) => updateProject(projectId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project", data.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", data.teamId] });
      queryClient.invalidateQueries({
        queryKey: ["projectProgress", data.projectId],
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      projectId: string;
      teamId?: string;
    }) => deleteProject(variables.projectId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });

      if (variables.teamId) {
        queryClient.invalidateQueries({
          queryKey: ["projects", variables.teamId],
        });
      }
    },
  });
};

export const useAddProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => addProjectMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", variables.projectId],
      });
    },
  });
};

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => removeProjectMember(projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", variables.projectId],
      });
    },
  });
};
