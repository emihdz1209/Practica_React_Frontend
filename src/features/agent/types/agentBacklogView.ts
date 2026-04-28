import type { AiSuggestionStatus } from "@/features/agent/types/aiBacklog";

export interface ApprovalDraft {
  fechaLimite: string;
  prioridadId: number;
  sprintId: string | null;
}

export interface ApprovalFormState {
  fechaLimite: string;
  prioridadId: string;
  sprintId: string;
}

export interface ApprovalTarget {
  aiTaskId: string;
  previousStatus?: AiSuggestionStatus;
  revertOnCancel?: boolean;
}
