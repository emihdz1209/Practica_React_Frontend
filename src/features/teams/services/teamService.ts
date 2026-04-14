import apiClient from "@/shared/api/apiClient";

import type {
  CreateTeamRequest,
  Team,
  TeamMember,
} from "@/features/teams/types/team";

export const createTeam = async (payload: CreateTeamRequest): Promise<Team> => {
  const response = await apiClient.post<Team>("/api/teams", payload);
  return response.data;
};

export const getTeams = async (): Promise<Team[]> => {
  const response = await apiClient.get<Team[]>("/api/teams");
  return response.data;
};

export const getTeamById = async (teamId: string): Promise<Team> => {
  const response = await apiClient.get<Team>(`/api/teams/${teamId}`);
  return response.data;
};

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const response = await apiClient.get<TeamMember[]>(`/api/teams/${teamId}/members`);
  return response.data;
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
  await apiClient.post(`/api/teams/${teamId}/members/${userId}`);
};

export const removeTeamMember = async (
  teamId: string,
  userId: string
): Promise<void> => {
  await apiClient.delete(`/api/teams/${teamId}/members/${userId}`);
};
