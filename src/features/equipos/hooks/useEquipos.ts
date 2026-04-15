import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEquipos, createEquipo } from "@/features/equipos/services/equipoService";
import type { CreateEquipoRequest } from "@/features/equipos/types/equipo";

export const useEquipos = () => {
  return useQuery({
    queryKey: ["equipos"],
    queryFn: getEquipos,
  });
};

export const useCreateEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (equipo: CreateEquipoRequest) => createEquipo(equipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipos"] });
    },
  });
};
