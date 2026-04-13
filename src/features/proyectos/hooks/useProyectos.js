import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getProyectos, createProyecto } from '../services/proyectoService';

export function useProyectos() {
  return useQuery('proyectos', getProyectos);
}

export function useCreateProyecto() {
  const queryClient = useQueryClient();
  return useMutation(createProyecto, {
    onSuccess: () => {
      queryClient.invalidateQueries('proyectos');
    },
  });
}
