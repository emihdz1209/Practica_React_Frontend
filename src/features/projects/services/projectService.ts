import apiClient from "@/shared/api/apiClient";

import type {
  CreateProjectRequest,
  Project,
  ProjectMember,
  ProjectProgressResponse,
  UpdateProjectRequest,
} from "@/features/projects/types/project";

export const createProject = async (
  teamId: string,
  payload: CreateProjectRequest
): Promise<Project> => {
  const response = await apiClient.post<Project>(`/api/teams/${teamId}/projects`, payload);
  return response.data;
};

export const getProjectsByTeam = async (teamId: string): Promise<Project[]> => {
  const response = await apiClient.get<Project[]>(`/api/teams/${teamId}/projects`);
  return response.data;
};

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await apiClient.get<Project>(`/api/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (
  projectId: string,
  payload: UpdateProjectRequest
): Promise<Project> => {
  const response = await apiClient.put<Project>(`/api/projects/${projectId}`, payload);
  return response.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/api/projects/${projectId}`);
};

export const getProjectProgress = async (
  projectId: string
): Promise<ProjectProgressResponse> => {
  const response = await apiClient.get<ProjectProgressResponse>(
    `/api/projects/${projectId}/progress`
  );

  return response.data;
};

export const getProjectMembers = async (
  projectId: string
): Promise<ProjectMember[]> => {
  const response = await apiClient.get<ProjectMember[]>(
    `/api/projects/${projectId}/members`
  );

  return response.data;
};

export const addProjectMember = async (
  projectId: string,
  userId: string
): Promise<void> => {
  await apiClient.post(`/api/projects/${projectId}/members/${userId}`);
};

export const removeProjectMember = async (
  projectId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/api/projects/${projectId}/members/${userId}`);
};
