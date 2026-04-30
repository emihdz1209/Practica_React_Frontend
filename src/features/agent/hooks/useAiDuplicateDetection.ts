import { useMutation, useQuery } from "@tanstack/react-query";
import {
  startDuplicateDetectionFor,
  getDuplicateDetectionLatestFor,
  getDuplicateDetectionRunsFor,
  getDuplicateDetectionRunResultsFor,
} from "@/features/agent/services/duplicateDetectionService";
import {
  backfillTaskEmbeddings,
  backfillVectorEmbeddings,
  getEmbeddingsStatus,
} from "@/features/agent/services/aiDuplicateDetectionService";

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

// --- Embedding hooks ---

export const useBackfillTaskEmbeddings = () => {
  return useMutation({
    mutationFn: ({ projectId }: { projectId: string }) =>
      backfillTaskEmbeddings(projectId),
  });
};

export const useEmbeddingsStatus = (
  projectId?: string,
  refetchInterval?: number | false
) => {
  return useQuery({
    queryKey: ["embeddingsStatus", projectId],
    queryFn: () => getEmbeddingsStatus(projectId!),
    enabled: !!projectId,
    refetchInterval,
  });
};

export const useBackfillVectorEmbeddings = () => {
  return useMutation({
    mutationFn: ({ projectId }: { projectId: string }) =>
      backfillVectorEmbeddings(projectId),
  });
};
