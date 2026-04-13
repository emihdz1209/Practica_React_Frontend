import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTareas, createTarea, updateTarea, deleteTarea } from '../services/tareaService';

export function useTareas() {
  return useQuery('tareas', getTareas);
}

export function useCreateTarea() {
  const queryClient = useQueryClient();
  return useMutation(createTarea, {
    onSuccess: () => {
      queryClient.invalidateQueries('tareas');
    },
  });
}

export function useUpdateTarea() {
  const queryClient = useQueryClient();
  return useMutation(({ taskId, data }) => updateTarea(taskId, data), {
    onSuccess: () => {
      queryClient.invalidateQueries('tareas');
    },
  });
}

export function useDeleteTarea() {
  const queryClient = useQueryClient();
  return useMutation(deleteTarea, {
    onSuccess: () => {
      queryClient.invalidateQueries('tareas');
    },
  });
}
