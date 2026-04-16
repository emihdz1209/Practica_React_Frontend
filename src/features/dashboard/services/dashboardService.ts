/// src/features/dashboard/services/dashboardService.ts

import { apiClient } from "@/shared/api/apiClient";
import type { ManagedProject } from "@/features/dashboard/types/dashboard";

export const getManagedProjects = async (
  userId: string
): Promise<ManagedProject[]> => {
  const normalizedId = userId.replace(/-/g, "").toUpperCase();
  const response = await apiClient.get<ManagedProject[]>(
    `/api/users/${normalizedId}/managed-projects`
  );
  return response.data;
};
