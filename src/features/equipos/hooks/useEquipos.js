import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getEquipos, createEquipo } from '../services/equipoService';

export function useEquipos() {
  return useQuery('equipos', getEquipos);
}

export function useCreateEquipo() {
  const queryClient = useQueryClient();
  return useMutation(createEquipo, {
    onSuccess: () => {
      queryClient.invalidateQueries('equipos');
    },
  });
}
