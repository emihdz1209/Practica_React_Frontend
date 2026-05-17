import { apiClient } from "@/shared/api/apiClient";
import type {
  DuplicateDetectionLatestResponse,
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

export const backfillVectorEmbeddings = async (
  projectId: string
): Promise<void> => {
  const pid = normalizeId(projectId);
  await apiClient.post(
    `/api/projects/${pid}/ai/task-vector-embeddings/backfill`
  );
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
