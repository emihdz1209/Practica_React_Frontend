export type DuplicateDetectionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface DuplicateDetectionRun {
  runId: string;
  projectId: string;
  status: DuplicateDetectionStatus;
  threshold: number;
  tasksAnalyzed: number;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

export interface DuplicateDetectionResult {
  resultId: string;
  runId: string;
  projectId: string;
  taskAId: string;
  taskATitle: string;
  taskBId: string;
  taskBTitle: string;
  similarityScore: number;
  reason: string;
  createdAt: string;
  distance?: number;
}

export interface DuplicateDetectionLatestResponse {
  run: DuplicateDetectionRun;
  results: DuplicateDetectionResult[];
}

export interface StartDuplicateDetectionRequest {
  threshold?: number;
}

export interface EmbeddingStatus {
  projectId: string;
  totalTasks: number;
  semanticEmbeddings: number;
  vectorEmbeddings: number;
  readyForVectorSearch: boolean;
}

export type EngineType = "llm" | "semantic" | "vector";

export interface MultiEngineResults {
  llm: DuplicateDetectionLatestResponse | null;
  semantic: DuplicateDetectionLatestResponse | null;
  vector: DuplicateDetectionLatestResponse | null;
}

export type PipelineStep =
  | "idle"
  | "backfill_semantic"
  | "waiting_semantic"
  | "backfill_vector"
  | "waiting_vector"
  | "running_engines"
  | "completed"
  | "error";
