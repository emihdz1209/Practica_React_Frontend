import apiClient from "@/shared/api/apiClient";

import type {
  DeveloperPerformanceItem,
  ProjectProgressResponse,
  SprintKpisResponse,
} from "@/features/kpis/types/kpis";

export const getSprintKpis = async (
  sprintId: string
): Promise<SprintKpisResponse> => {
  const response = await apiClient.get<SprintKpisResponse>(
    `/api/sprints/${sprintId}/kpis`
  );

  return response.data;
};

export const getProjectProgress = async (
  projectId: string
): Promise<ProjectProgressResponse> => {
  const response = await apiClient.get<ProjectProgressResponse>(
    `/api/projects/${projectId}/progress`
  );

  return response.data;
};

export const getDevelopersPerformance = async (
  projectId: string
): Promise<DeveloperPerformanceItem[]> => {
  const response = await apiClient.get<DeveloperPerformanceItem[]>(
    `/api/projects/${projectId}/developers/performance`
  );

  return response.data;
};
