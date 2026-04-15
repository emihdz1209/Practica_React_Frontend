import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { getProyectosByTeam, createProyecto } from "@/features/proyectos/services/proyectoService";
import type { CreateProyectoRequest, Proyecto } from "@/features/proyectos/types/proyecto";

export const useProyectos = (teamId?: string) => {
  return useQuery({
    queryKey: ["proyectos", teamId],
    queryFn: () => getProyectosByTeam(teamId!),
    enabled: !!teamId,
  });
};

/** Fetches all projects across all provided team IDs (for dashboard). */
export const useAllProyectos = (teamIds: string[]) => {
  const queries = useQueries({
    queries: teamIds.map((teamId) => ({
      queryKey: ["proyectos", teamId],
      queryFn: () => getProyectosByTeam(teamId),
    })),
  });

  const data: Proyecto[] = queries.flatMap((q) => q.data ?? []);
  const isLoading = queries.some((q) => q.isLoading);

  return { data, isLoading };
};

export const useCreateProyecto = (teamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proyecto: CreateProyectoRequest) => createProyecto(teamId, proyecto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proyectos", teamId] });
    },
  });
};
