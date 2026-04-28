import { useEffect, useMemo, useState } from "react";

import type {
  AiSuggestionStatus,
  AiTaskSuggestion,
} from "@/features/agent/types/aiBacklog";
import type {
  ApprovalDraft,
  ApprovalFormState,
  ApprovalTarget,
} from "@/features/agent/types/agentBacklogView";
import {
  getDefaultFechaLimite,
  getTodayDateValue,
} from "@/features/agent/utils/agentBacklogUtils";
import {
  approveAiSuggestion,
  rejectAiSuggestion,
} from "@/features/agent/services/aiBacklogService";
import { toApiDateTime } from "@/features/tareas/components/tareasModal/tareasModalUtils";

interface PriorityOption {
  prioridadId: number;
  nombre: string;
  orden?: number;
}

interface UseAiApprovalWorkflowOptions {
  suggestions: AiTaskSuggestion[];
  priorityOptions: PriorityOption[];
  projectId?: string;
  refetchSuggestions: () => Promise<{ data?: AiTaskSuggestion[] }>;
}

export const useAiApprovalWorkflow = ({
  suggestions,
  priorityOptions,
  projectId,
  refetchSuggestions,
}: UseAiApprovalWorkflowOptions) => {
  const [statusMap, setStatusMap] = useState<Record<string, AiSuggestionStatus>>({});
  const [approvalMap, setApprovalMap] = useState<Record<string, ApprovalDraft>>({});
  const [approvalTarget, setApprovalTarget] = useState<ApprovalTarget | null>(null);
  const [approvalForm, setApprovalForm] = useState<ApprovalFormState>({
    fechaLimite: "",
    prioridadId: "",
    sprintId: "",
  });
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!suggestions) {
      return;
    }

    setStatusMap((current) => {
      let changed = false;
      const suggestionIds = new Set<string>();
      const next: Record<string, AiSuggestionStatus> = {};

      suggestions.forEach((suggestion) => {
        suggestionIds.add(suggestion.aiTaskId);
        const nextStatus = current[suggestion.aiTaskId] ?? suggestion.status ?? "PENDING";
        next[suggestion.aiTaskId] = nextStatus;

        if (current[suggestion.aiTaskId] !== nextStatus) {
          changed = true;
        }
      });

      if (!changed) {
        const currentKeys = Object.keys(current);

        if (currentKeys.length !== suggestionIds.size) {
          changed = true;
        } else {
          for (const key of currentKeys) {
            if (!suggestionIds.has(key)) {
              changed = true;
              break;
            }
          }
        }
      }

      return changed ? next : current;
    });
  }, [suggestions]);

  useEffect(() => {
    if (!suggestions) {
      return;
    }

    setApprovalMap((current) => {
      const suggestionIds = new Set(suggestions.map((suggestion) => suggestion.aiTaskId));
      const keysToRemove = Object.keys(current).filter((key) => !suggestionIds.has(key));

      if (keysToRemove.length === 0) {
        return current;
      }

      const next = { ...current };

      keysToRemove.forEach((key) => {
        delete next[key];
      });

      return next;
    });
  }, [suggestions]);

  const openApprovalModal = (
    aiTaskId: string,
    options?: { previousStatus?: AiSuggestionStatus; revertOnCancel?: boolean }
  ) => {
    const existingDraft = approvalMap[aiTaskId];
    const defaultPriorityId = priorityOptions[0]?.prioridadId;

    setApprovalForm({
      fechaLimite: existingDraft?.fechaLimite ?? getDefaultFechaLimite(),
      prioridadId: existingDraft?.prioridadId
        ? String(existingDraft.prioridadId)
        : defaultPriorityId
        ? String(defaultPriorityId)
        : "",
      sprintId: existingDraft?.sprintId ?? "",
    });

    setApprovalError(null);
    setApprovalTarget({
      aiTaskId,
      previousStatus: options?.previousStatus,
      revertOnCancel: options?.revertOnCancel,
    });
  };

  const handleCloseApprovalModal = () => {
    if (approvalTarget?.revertOnCancel && approvalTarget.previousStatus) {
      setStatusMap((current) => ({
        ...current,
        [approvalTarget.aiTaskId]: approvalTarget.previousStatus as AiSuggestionStatus,
      }));
    }

    setApprovalTarget(null);
    setApprovalError(null);
  };

  const handleSaveApproval = () => {
    if (!approvalTarget) {
      return;
    }

    setApprovalError(null);

    if (!approvalForm.fechaLimite || !approvalForm.prioridadId) {
      setApprovalError("Completa fecha limite y prioridad para aceptar.");
      return;
    }

    const selectedDateValue = approvalForm.fechaLimite.slice(0, 10);
    if (selectedDateValue < getTodayDateValue()) {
      setApprovalError("La fecha limite no puede ser anterior al dia de hoy.");
      return;
    }

    const prioridadId = Number(approvalForm.prioridadId);

    if (!Number.isFinite(prioridadId)) {
      setApprovalError("Prioridad invalida.");
      return;
    }

    setApprovalMap((current) => ({
      ...current,
      [approvalTarget.aiTaskId]: {
        fechaLimite: approvalForm.fechaLimite,
        prioridadId,
        sprintId: approvalForm.sprintId || null,
      },
    }));

    setStatusMap((current) => ({
      ...current,
      [approvalTarget.aiTaskId]: "APPROVED",
    }));

    setApprovalTarget(null);
  };

  const handleStatusChange = (
    aiTaskId: string,
    nextStatus: AiSuggestionStatus,
    previousStatus: AiSuggestionStatus
  ) => {
    setStatusMap((current) => ({
      ...current,
      [aiTaskId]: nextStatus,
    }));

    if (nextStatus === "APPROVED" && !approvalMap[aiTaskId]) {
      openApprovalModal(aiTaskId, { previousStatus, revertOnCancel: true });
    }
  };

  const handleApplyDecisions = async () => {
    if (!projectId) {
      return;
    }

    setApplyError(null);
    setApplySuccess(null);

    const decisions = suggestions.map((suggestion) => {
      const localStatus = statusMap[suggestion.aiTaskId] ?? suggestion.status ?? "PENDING";
      return { suggestion, localStatus };
    });

    const toApprove = decisions.filter(
      ({ suggestion, localStatus }) => suggestion.status === "PENDING" && localStatus === "APPROVED"
    );
    const toReject = decisions.filter(
      ({ suggestion, localStatus }) => suggestion.status === "PENDING" && localStatus === "REJECTED"
    );

    if (toApprove.length === 0 && toReject.length === 0) {
      setApplyError("No hay cambios por aplicar.");
      return;
    }

    const missingApproval = toApprove.filter(
      ({ suggestion }) => !approvalMap[suggestion.aiTaskId]
    );

    if (missingApproval.length > 0) {
      setApplyError("Completa fecha limite y prioridad en las sugerencias aceptadas.");
      return;
    }

    setIsApplying(true);

    try {
      await Promise.all([
        ...toReject.map(({ suggestion }) => rejectAiSuggestion(suggestion.aiTaskId)),
        ...toApprove.map(({ suggestion }) => {
          const draft = approvalMap[suggestion.aiTaskId];
          const payload = {
            fechaLimite: toApiDateTime(draft.fechaLimite),
            prioridadId: draft.prioridadId,
            sprintId: draft.sprintId ?? null,
          };
          return approveAiSuggestion(suggestion.aiTaskId, payload);
        }),
      ]);

      const refreshed = await refetchSuggestions();
      const refreshedData = refreshed.data ?? [];
      setStatusMap(() => {
        const next: Record<string, AiSuggestionStatus> = {};
        refreshedData.forEach((suggestion) => {
          next[suggestion.aiTaskId] = suggestion.status ?? "PENDING";
        });
        return next;
      });

      setApplySuccess("Sugerencias procesadas correctamente.");
    } catch {
      setApplyError("No se pudieron procesar las sugerencias. Intenta nuevamente.");
    } finally {
      setIsApplying(false);
    }
  };

  const pendingChanges = useMemo(() => {
    return suggestions.filter((suggestion) => {
      const localStatus = statusMap[suggestion.aiTaskId] ?? suggestion.status ?? "PENDING";
      return suggestion.status === "PENDING" && localStatus !== "PENDING";
    }).length;
  }, [statusMap, suggestions]);

  return {
    statusMap,
    approvalMap,
    approvalTarget,
    approvalForm,
    setApprovalForm,
    approvalError,
    applyError,
    applySuccess,
    isApplying,
    pendingChanges,
    openApprovalModal,
    handleCloseApprovalModal,
    handleSaveApproval,
    handleStatusChange,
    handleApplyDecisions,
  };
};
