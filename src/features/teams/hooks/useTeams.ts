import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addTeamMember,
  createTeam,
  getTeamById,
  getTeamMembers,
  getTeams,
  removeTeamMember,
} from "@/features/teams/services/teamService";

import type { CreateTeamRequest } from "@/features/teams/types/team";

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });
};

export const useTeam = (teamId?: string) => {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeamById(teamId as string),
    enabled: Boolean(teamId),
  });
};

export const useTeamMembers = (teamId?: string) => {
  return useQuery({
    queryKey: ["teamMembers", teamId],
    queryFn: () => getTeamMembers(teamId as string),
    enabled: Boolean(teamId),
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeamRequest) => createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      addTeamMember(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teamMembers", variables.teamId],
      });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teamMembers", variables.teamId],
      });
    },
  });
};
