import { useMutation, useQuery } from "@tanstack/react-query";
import {
  startDuplicateDetectionFor,
  getDuplicateDetectionLatestFor,
  getDuplicateDetectionRunsFor,
  getDuplicateDetectionRunResultsFor,
} from "@/features/agent/services/duplicateDetectionService";

export const useStartDuplicateDetection = (method: string = "duplicate-detection") => {
  return useMutation({
    mutationFn: ({ projectId, threshold }: { projectId: string; threshold?: number }) =>
      startDuplicateDetectionFor(method, projectId, { threshold }),
  });
};

export const useDuplicateDetectionLatest = (
  projectId?: string,
  refetchInterval?: number | false,
  method: string = "duplicate-detection"
) => {
  return useQuery({
    queryKey: ["duplicateDetection", "latest", method, projectId],
    queryFn: () => getDuplicateDetectionLatestFor(method, projectId!),
    enabled: !!projectId,
    refetchInterval,
  });
};

export const useDuplicateDetectionRuns = (
  projectId?: string,
  refetchInterval?: number | false,
  method: string = "duplicate-detection"
) => {
  return useQuery({
    queryKey: ["duplicateDetection", "runs", method, projectId],
    queryFn: () => getDuplicateDetectionRunsFor(method, projectId!),
    enabled: !!projectId,
    refetchInterval,
  });
};

export const useDuplicateDetectionRunResults = (
  projectId?: string,
  runId?: string,
  refetchInterval?: number | false,
  method: string = "duplicate-detection"
) => {
  return useQuery({
    queryKey: ["duplicateDetection", "runResults", method, projectId, runId],
    queryFn: () => getDuplicateDetectionRunResultsFor(method, projectId!, runId!),
    enabled: !!projectId && !!runId,
    refetchInterval,
  });
};
