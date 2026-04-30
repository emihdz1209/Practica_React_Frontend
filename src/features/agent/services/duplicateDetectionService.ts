import { apiClient } from "@/shared/api/apiClient";
import type {
  DuplicateDetectionLatestResponse,
  DuplicateDetectionResult,
  DuplicateDetectionRun,
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

const resolveMethodSegment = (methodSegment: string) => {
  if (methodSegment === "semantic-duplicate-detection") return "duplicate-detection/semantic";
  if (methodSegment === "vector-duplicate-detection") return "duplicate-detection/vector";
  return methodSegment;
};

const buildBasePath = (projectId: string, methodSegment: string) => {
  const pid = normalizeId(projectId);
  return `/api/projects/${pid}/ai/${resolveMethodSegment(methodSegment)}`;
};

export const startDuplicateDetectionFor = async (
  methodSegment: string,
  projectId: string,
  payload: StartDuplicateDetectionRequest
): Promise<DuplicateDetectionRun> => {
  const path = buildBasePath(projectId, methodSegment);
  const response = await apiClient.post<DuplicateDetectionRun>(
    `${path}`,
    payload
  );
  return response.data;
};

export const getDuplicateDetectionLatestFor = async (
  methodSegment: string,
  projectId: string
): Promise<DuplicateDetectionLatestResponse> => {
  const path = buildBasePath(projectId, methodSegment);
  const response = await apiClient.get<DuplicateDetectionLatestResponse>(
    `${path}/latest`
  );
  return response.data;
};

export const getDuplicateDetectionRunsFor = async (
  methodSegment: string,
  projectId: string
): Promise<DuplicateDetectionRun[]> => {
  const path = buildBasePath(projectId, methodSegment);
  const response = await apiClient.get<DuplicateDetectionRun[]>(`${path}/runs`);
  return response.data;
};

export const getDuplicateDetectionRunResultsFor = async (
  methodSegment: string,
  projectId: string,
  runId: string
): Promise<DuplicateDetectionResult[]> => {
  const pid = normalizeId(projectId);
  const rid = normalizeId(runId);
  const path = `/api/projects/${pid}/ai/${resolveMethodSegment(methodSegment)}/runs/${rid}/results`;
  const response = await apiClient.get<DuplicateDetectionResult[]>(path);
  return response.data;
};
