import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import type {
  AiSuggestionStatus,
  AiTaskSuggestion,
} from "@/features/agent/types/aiBacklog";
import type { ApprovalDraft } from "@/features/agent/types/agentBacklogView";
import {
  AI_SUGGESTION_COLUMNS,
  sortSuggestions,
} from "@/features/agent/utils/agentBacklogUtils";
import styles from "@/features/agent/styles/AgentBacklogPage.module.css";

interface AgentSuggestionsBoardProps {
  suggestions: AiTaskSuggestion[];
  statusMap: Record<string, AiSuggestionStatus>;
  approvalMap: Record<string, ApprovalDraft>;
  priorityNameMap: Map<number, string>;
  formatDate: (value: string | null | undefined) => string;
  onStatusChange: (
    aiTaskId: string,
    nextStatus: AiSuggestionStatus,
    previousStatus: AiSuggestionStatus
  ) => void;
  onEditApproval: (aiTaskId: string) => void;
}

export const AgentSuggestionsBoard = ({
  suggestions,
  statusMap,
  approvalMap,
  priorityNameMap,
  formatDate,
  onStatusChange,
  onEditApproval,
}: AgentSuggestionsBoardProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropStatus, setDropStatus] = useState<AiSuggestionStatus | null>(null);
  const [columnHeight, setColumnHeight] = useState(560);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateColumnHeight = () => {
      const boardTop = boardRef.current?.getBoundingClientRect().top;

      if (boardTop === undefined) {
        return;
      }

      const viewportHeight = window.innerHeight;
      const appContainer = boardRef.current?.closest(".App") as HTMLElement | null;
      const appPaddingBottom = appContainer
        ? Number.parseFloat(window.getComputedStyle(appContainer).paddingBottom || "0")
        : 0;
      const nextHeight = Math.max(
        260,
        Math.floor(viewportHeight - boardTop - appPaddingBottom - 8)
      );

      setColumnHeight((current) => (current === nextHeight ? current : nextHeight));
    };

    updateColumnHeight();
    window.addEventListener("resize", updateColumnHeight);

    return () => {
      window.removeEventListener("resize", updateColumnHeight);
    };
  }, [suggestions.length]);

  if (!suggestions || suggestions.length === 0) {
    return <p className="kanban-empty">No hay sugerencias generadas</p>;
  }

  const boardStyle = {
    ["--kanban-column-height" as string]: `${columnHeight}px`,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  } as CSSProperties;

  const resolveStatus = (suggestion: AiTaskSuggestion): AiSuggestionStatus =>
    statusMap[suggestion.aiTaskId] ?? suggestion.status ?? "PENDING";

  const resolveApproval = (suggestionId: string) => approvalMap[suggestionId];

  const handleCardDragStart = (
    suggestionId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    setDraggedId(suggestionId);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-ai-suggestion-id", suggestionId);
    event.dataTransfer.setData("text/plain", suggestionId);
  };

  const handleCardDragEnd = () => {
    setDraggedId(null);
    setDropStatus(null);
  };

  const getDraggedSuggestion = (event: React.DragEvent<HTMLDivElement>) => {
    const dataId =
      event.dataTransfer.getData("application/x-ai-suggestion-id") ||
      event.dataTransfer.getData("text/plain") ||
      draggedId;

    if (!dataId) {
      return null;
    }

    return suggestions.find((suggestion) => suggestion.aiTaskId === dataId) || null;
  };

  const handleColumnDragOver = (
    status: AiSuggestionStatus,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    if (!draggedId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropStatus(status);
  };

  const handleColumnDrop = (
    status: AiSuggestionStatus,
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    const draggedSuggestion = getDraggedSuggestion(event);

    setDropStatus(null);
    setDraggedId(null);

    if (!draggedSuggestion) {
      return;
    }

    const previousStatus = resolveStatus(draggedSuggestion);

    if (previousStatus === status) {
      return;
    }

    onStatusChange(draggedSuggestion.aiTaskId, status, previousStatus);
  };

  return (
    <div className="kanban-board" ref={boardRef} style={boardStyle}>
      {AI_SUGGESTION_COLUMNS.map((column) => {
        const cards = sortSuggestions(
          suggestions.filter((suggestion) => resolveStatus(suggestion) === column.status)
        );

        return (
          <div
            key={column.status}
            className={`kanban-column kanban-column-drop-target ${
              dropStatus === column.status ? "is-drop-active" : ""
            }`}
            onDragOver={(event) => handleColumnDragOver(column.status, event)}
            onDragEnter={(event) => handleColumnDragOver(column.status, event)}
            onDragLeave={() => {
              setDropStatus((current) => (current === column.status ? null : current));
            }}
            onDrop={(event) => handleColumnDrop(column.status, event)}
          >
            <div
              className="kanban-col-header"
              style={{ background: column.headerBg, borderBottomColor: column.headerBorder }}
            >
              <span className="kanban-col-label" style={{ color: column.accent }}>
                {column.label}
              </span>
              <span
                className="kanban-col-count"
                style={{ background: column.countBg, color: column.countColor }}
              >
                {cards.length}
              </span>
            </div>

            <div className="kanban-col-body">
              {cards.length === 0 && <p className="kanban-col-empty">Sin sugerencias</p>}

              {cards.map((suggestion) => {
                const approval = resolveApproval(suggestion.aiTaskId);
                const priorityLabel = approval?.prioridadId
                  ? priorityNameMap.get(approval.prioridadId)
                  : undefined;

                return (
                  <div
                    key={suggestion.aiTaskId}
                    className={`tarea-card tarea-card-clickable ${
                      draggedId === suggestion.aiTaskId ? "tarea-card--dragging" : ""
                    }`}
                    draggable
                    onDragStart={(event) => handleCardDragStart(suggestion.aiTaskId, event)}
                    onDragEnd={handleCardDragEnd}
                    aria-label={suggestion.titulo}
                  >
                    <div className={styles.cardMeta}>
                      <span className={styles.cardBadge}>
                        {suggestion.tiempoEstimado} hrs
                      </span>
                      <span className={styles.cardDate}>
                        {formatDate(approval?.fechaLimite)}
                      </span>
                    </div>

                    <p className="tarea-titulo">{suggestion.titulo}</p>
                    <p className={styles.cardDescription}>{suggestion.descripcion}</p>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardTag}>
                        {priorityLabel ? `Prioridad: ${priorityLabel}` : "Prioridad pendiente"}
                      </span>

                      {resolveStatus(suggestion) === "APPROVED" && (
                        <button
                          type="button"
                          className={styles.cardAction}
                          onClick={(event) => {
                            event.stopPropagation();
                            onEditApproval(suggestion.aiTaskId);
                          }}
                        >
                          Editar datos
                        </button>
                      )}
                    </div>

                    {resolveStatus(suggestion) === "APPROVED" && !approval && (
                      <span className={styles.cardWarning}>
                        Completa fecha limite y prioridad
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
