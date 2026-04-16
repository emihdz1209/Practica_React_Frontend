/// src/features/dashboard/hooks/dashboard.ts

import { useQuery, useQueries } from "@tanstack/react-query";
import { getManagedProjects } from "@/features/dashboard/services/dashboardService";
import {
  getProjectSprints,
  getSprintKpis,
  getProjectProgress,
  getDeveloperPerformance,
} from "@/features/proyectos/services/proyectoService";
import type { ManagedProject } from "@/features/dashboard/types/dashboard";
import type { Sprint, SprintKpis, ProjectProgress, DeveloperPerformance } from "@/features/proyectos/types/proyecto";

/* ── Fetch managed projects for a manager ─────────────────────────── */

export const useManagedProjects = (userId?: string) => {
  return useQuery({
    queryKey: ["managedProjects", userId],
    queryFn: () => getManagedProjects(userId!),
    enabled: !!userId,
  });
};

/* ── Fetch sprints for each selected project ──────────────────────── */

export const useMultiProjectSprints = (projectIds: string[]) => {
  const queries = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: ["sprints", pid],
      queryFn: () => getProjectSprints(pid),
      enabled: !!pid,
    })),
  });

  const data: Record<string, Sprint[]> = {};
  projectIds.forEach((pid, i) => {
    data[pid] = queries[i]?.data ?? [];
  });

  const isLoading = queries.some((q) => q.isLoading);
  return { data, isLoading };
};

/* ── Fetch KPIs for every sprint across selected projects ─────────── */

export const useMultiProjectSprintKpis = (
  sprintsByProject: Record<string, Sprint[]>
) => {
  const allSprints: { projectId: string; sprint: Sprint }[] = [];
  for (const [pid, sprints] of Object.entries(sprintsByProject)) {
    for (const sprint of sprints) {
      allSprints.push({ projectId: pid, sprint });
    }
  }

  const queries = useQueries({
    queries: allSprints.map(({ sprint }) => ({
      queryKey: ["sprintKpis", sprint.sprintId],
      queryFn: () => getSprintKpis(sprint.sprintId),
    })),
  });

  // Aggregate KPIs per project
  const kpisByProject: Record<string, SprintKpis[]> = {};
  allSprints.forEach(({ projectId }, i) => {
    if (!kpisByProject[projectId]) kpisByProject[projectId] = [];
    if (queries[i]?.data) kpisByProject[projectId].push(queries[i].data!);
  });

  const isLoading = queries.some((q) => q.isLoading);
  return { data: kpisByProject, isLoading };
};

/* ── Fetch progress for each selected project ─────────────────────── */

export const useMultiProjectProgress = (projectIds: string[]) => {
  const queries = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: ["projectProgress", pid],
      queryFn: () => getProjectProgress(pid),
      enabled: !!pid,
    })),
  });

  const data: Record<string, ProjectProgress> = {};
  projectIds.forEach((pid, i) => {
    if (queries[i]?.data) data[pid] = queries[i].data!;
  });

  const isLoading = queries.some((q) => q.isLoading);
  return { data, isLoading };
};

/* ── Fetch developer performance for each selected project ────────── */

export const useMultiProjectDevPerformance = (projectIds: string[]) => {
  const queries = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: ["developerPerformance", pid],
      queryFn: () => getDeveloperPerformance(pid),
      enabled: !!pid,
    })),
  });

  const data: Record<string, DeveloperPerformance[]> = {};
  projectIds.forEach((pid, i) => {
    data[pid] = queries[i]?.data ?? [];
  });

  const isLoading = queries.some((q) => q.isLoading);
  return { data, isLoading };
};
