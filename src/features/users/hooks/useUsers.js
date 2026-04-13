import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getUsers, createUser } from '../services/userService';

export function useUsers() {
  return useQuery('users', getUsers);
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });
}
