import { apiClient } from "@/shared/api/apiClient";
import type {
  DuplicateDetectionLatestResponse,
  DuplicateDetectionResult,
  DuplicateDetectionRun,
  EmbeddingStatus,
  StartDuplicateDetectionRequest,
} from "@/features/agent/types/aiDuplicateDetection";

const ensureHyphenatedUuid = (id: string) => {
  if (!id) return id;
  if (id.includes("-")) return id;
  const clean = id.replace(/[^0-9a-fA-F]/g, "");
  if (clean.length !== 32) return id;
  return (
    clean.slice(0, 8) +
    "-" +
    clean.slice(8, 12) +
    "-" +
    clean.slice(12, 16) +
    "-" +
    clean.slice(16, 20) +
    "-" +
    clean.slice(20)
  ).toLowerCase();
};

const normalizeId = (value: string) => ensureHyphenatedUuid(value);

export const startDuplicateDetection = async (
  projectId: string,
  payload: StartDuplicateDetectionRequest
): Promise<DuplicateDetectionRun> => {
  const pid = normalizeId(projectId);
  const response = await apiClient.post<DuplicateDetectionRun>(
    `/api/projects/${pid}/ai/duplicate-detection`,
    payload
  );
  return response.data;
};

export const getDuplicateDetectionLatest = async (
  projectId: string
): Promise<DuplicateDetectionLatestResponse> => {
  const pid = normalizeId(projectId);
  const response = await apiClient.get<DuplicateDetectionLatestResponse>(
    `/api/projects/${pid}/ai/duplicate-detection/latest`
  );
  return response.data;
};

export const getDuplicateDetectionRuns = async (
  projectId: string
): Promise<DuplicateDetectionRun[]> => {
  const pid = normalizeId(projectId);
  const response = await apiClient.get<DuplicateDetectionRun[]>(
    `/api/projects/${pid}/ai/duplicate-detection/runs`
  );
  return response.data;
};

export const getDuplicateDetectionRunResults = async (
  projectId: string,
  runId: string
): Promise<DuplicateDetectionResult[]> => {
  const pid = normalizeId(projectId);
  const rid = normalizeId(runId);
  const response = await apiClient.get<DuplicateDetectionResult[]>(
    `/api/projects/${pid}/ai/duplicate-detection/runs/${rid}/results`
  );
  return response.data;
};

// --- Embedding management ---

export const backfillTaskEmbeddings = async (
  projectId: string
): Promise<void> => {
  const pid = normalizeId(projectId);
  await apiClient.post(`/api/projects/${pid}/ai/task-embeddings/backfill`);
};

export const getEmbeddingsStatus = async (
  projectId: string
): Promise<EmbeddingStatus> => {
  const pid = normalizeId(projectId);
  const response = await apiClient.get<EmbeddingStatus>(
    `/api/projects/${pid}/ai/task-embeddings/status`
  );
  return response.data;
};

export const backfillVectorEmbeddings = async (
  projectId: string
): Promise<void> => {
  const pid = normalizeId(projectId);
  await apiClient.post(
    `/api/projects/${pid}/ai/task-vector-embeddings/backfill`
  );
};

// --- Semantic duplicate detection (Python embeddings) ---

export const startSemanticDuplicateDetection = async (
  projectId: string,
  payload: StartDuplicateDetectionRequest
): Promise<DuplicateDetectionRun> => {
  const pid = normalizeId(projectId);
  const response = await apiClient.post<DuplicateDetectionRun>(
    `/api/projects/${pid}/ai/duplicate-detection/semantic`,
    payload
  );
  return response.data;
};

export const getSemanticDuplicateDetectionLatest = async (
  projectId: string
): Promise<DuplicateDetectionLatestResponse> => {
  const pid = normalizeId(projectId);
  const response = await apiClient.get<DuplicateDetectionLatestResponse>(
    `/api/projects/${pid}/ai/duplicate-detection/semantic/latest`
  );
  return response.data;
};

// --- Vector duplicate detection (Oracle AI Vector Search) ---

export const startVectorDuplicateDetection = async (
  projectId: string,
  payload: StartDuplicateDetectionRequest
): Promise<DuplicateDetectionRun> => {
  const pid = normalizeId(projectId);
  const response = await apiClient.post<DuplicateDetectionRun>(
    `/api/projects/${pid}/ai/duplicate-detection/vector`,
    payload
  );
  return response.data;
};

export const getVectorDuplicateDetectionLatest = async (
  projectId: string
): Promise<DuplicateDetectionLatestResponse> => {
  const pid = normalizeId(projectId);
  const response = await apiClient.get<DuplicateDetectionLatestResponse>(
    `/api/projects/${pid}/ai/duplicate-detection/vector/latest`
  );
  return response.data;
};
