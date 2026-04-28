import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getDuplicateDetectionLatest,
  getDuplicateDetectionRuns,
  getDuplicateDetectionRunResults,
  startDuplicateDetection,
} from "@/features/agent/services/aiDuplicateDetectionService";

export const useStartDuplicateDetection = () => {
  return useMutation({
    mutationFn: ({ projectId, threshold }: { projectId: string; threshold?: number }) =>
      startDuplicateDetection(projectId, { threshold }),
  });
};

export const useDuplicateDetectionLatest = (
  projectId?: string,
  refetchInterval?: number | false
) => {
  return useQuery({
    queryKey: ["duplicateDetection", "latest", projectId],
    queryFn: () => getDuplicateDetectionLatest(projectId!),
    enabled: !!projectId,
    refetchInterval,
  });
};

export const useDuplicateDetectionRuns = (
  projectId?: string,
  refetchInterval?: number | false
) => {
  return useQuery({
    queryKey: ["duplicateDetection", "runs", projectId],
    queryFn: () => getDuplicateDetectionRuns(projectId!),
    enabled: !!projectId,
    refetchInterval,
  });
};

export const useDuplicateDetectionRunResults = (
  projectId?: string,
  runId?: string,
  refetchInterval?: number | false
) => {
  return useQuery({
    queryKey: ["duplicateDetection", "runResults", projectId, runId],
    queryFn: () => getDuplicateDetectionRunResults(projectId!, runId!),
    enabled: !!projectId && !!runId,
    refetchInterval,
  });
};
