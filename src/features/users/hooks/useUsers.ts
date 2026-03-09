import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getUsers, createUser } from "@/features/users/services/userService";

import type { CreateUserRequest } from "@/features/users/types/user";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: CreateUserRequest) => createUser(user),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};