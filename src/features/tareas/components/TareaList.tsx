import React from "react";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Tarea } from "@/features/tareas/types/tarea";

const PRIO: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: "Alta",  bg: "#DC2626", color: "#fff" },
  2: { label: "Media", bg: "#D97706", color: "#fff" },
  3: { label: "Baja",  bg: "#16A34A", color: "#fff" },
};

const COLUMNS = [
  { estadoId: 1, label: "Pendiente",  accent: "#D97706", headerBg: "#FFFBEB", headerBorder: "#FDE68A", countBg: "#FCD34D", countColor: "#78350F" },
  { estadoId: 2, label: "En Proceso", accent: "#2563EB", headerBg: "#EFF6FF", headerBorder: "#BFDBFE", countBg: "#BFDBFE", countColor: "#1E3A8A" },
  { estadoId: 3, label: "Completada", accent: "#16A34A", headerBg: "#F0FDF4", headerBorder: "#BBF7D0", countBg: "#BBF7D0", countColor: "#14532D" },
  { estadoId: 4, label: "Cancelada",  accent: "#6B7280", headerBg: "#F9FAFB", headerBorder: "#E5E7EB", countBg: "#E5E7EB", countColor: "#374151" },
];

const sortTareas = (list: Tarea[]) =>
  [...list].sort((a, b) => {
    const da = a.fechaLimite ? new Date(a.fechaLimite).getTime() : Infinity;
    const db = b.fechaLimite ? new Date(b.fechaLimite).getTime() : Infinity;
    if (da !== db) return da - db;
    return (a.prioridadId || 99) - (b.prioridadId || 99);
  });

const fmt = (str: string | null) =>
  str
    ? new Date(str).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
    : "—";

interface TareaCardProps {
  tarea: Tarea;
  onDelete: (taskId: string) => void;
  onStatusChange: (tarea: Tarea, newEstadoId: number) => void;
  onOpenDetails: (taskId: string) => void;
  onDragStart: (taskId: string, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  suppressClick: boolean;
}

function TareaCard({
  tarea,
  onDelete,
  onStatusChange,
  onOpenDetails,
  onDragStart,
  onDragEnd,
  isDragging,
  suppressClick,
}: TareaCardProps) {
  const p = PRIO[tarea.prioridadId] || { label: "—", bg: "#E4E4E7", color: "#52525B" };
  const done = tarea.estadoId === 3;

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpenDetails(tarea.taskId);
  };

  const handleCardClick = () => {
    if (suppressClick || isDragging) {
      return;
    }

    onOpenDetails(tarea.taskId);
  };

  return (
    <div
      className={`tarea-card tarea-card-clickable ${isDragging ? "tarea-card--dragging" : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      draggable
      onDragStart={(event) => onDragStart(tarea.taskId, event)}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${tarea.titulo}`}
    >
      <div className="tarea-card-meta">
        <span className="prio-badge" style={{ background: p.bg, color: p.color }}>
          {p.label}
        </span>
        <span className="tarea-fecha">{fmt(tarea.fechaLimite)}</span>
      </div>

      <p
        className="tarea-titulo"
        style={{ opacity: done ? 0.4 : 1, textDecoration: done ? "line-through" : "none" }}
      >
        {tarea.titulo}
      </p>

      <div className="tarea-card-actions">
        <Button
          className="DoneButton"
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onStatusChange(tarea, done ? 1 : 3);
          }}
          style={{ fontSize: "11px", padding: "2px 8px", minWidth: 0 }}
        >
          {done ? "Reabrir" : "Completar"}
        </Button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(tarea.taskId);
          }}
          className="tarea-delete-btn"
          title="Eliminar"
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}

interface TareaListProps {
  tareas: Tarea[];
  onDelete: (taskId: string) => void;
  onStatusChange: (tarea: Tarea, newEstadoId: number) => void;
  onOpenDetails: (taskId: string) => void;
}

export const TareaList = ({ tareas, onDelete, onStatusChange, onOpenDetails }: TareaListProps) => {
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dropEstadoId, setDropEstadoId] = React.useState<number | null>(null);
  const [suppressClickTaskId, setSuppressClickTaskId] = React.useState<string | null>(null);
  const [columnHeight, setColumnHeight] = React.useState(560);
  const boardRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
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
  }, [tareas.length]);

  const boardStyle = {
    ["--kanban-column-height" as string]: `${columnHeight}px`,
  } as React.CSSProperties;

  if (!tareas || tareas.length === 0)
    return <p className="kanban-empty">No hay tareas registradas</p>;

  const getDraggedTask = (event: React.DragEvent<HTMLDivElement>) => {
    const dataTaskId =
      event.dataTransfer.getData("application/x-task-id") ||
      event.dataTransfer.getData("text/plain") ||
      draggedTaskId;

    if (!dataTaskId) {
      return null;
    }

    return tareas.find((task) => task.taskId === dataTaskId) || null;
  };

  const handleCardDragStart = (taskId: string, event: React.DragEvent<HTMLDivElement>) => {
    setDraggedTaskId(taskId);
    setSuppressClickTaskId(null);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-task-id", taskId);
    event.dataTransfer.setData("text/plain", taskId);
  };

  const handleCardDragEnd = () => {
    if (draggedTaskId) {
      setSuppressClickTaskId(draggedTaskId);
      window.setTimeout(() => setSuppressClickTaskId(null), 0);
    }

    setDraggedTaskId(null);
    setDropEstadoId(null);
  };

  const handleColumnDragOver = (estadoId: number, event: React.DragEvent<HTMLDivElement>) => {
    if (!draggedTaskId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropEstadoId(estadoId);
  };

  const handleColumnDrop = (estadoId: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const draggedTask = getDraggedTask(event);

    setDropEstadoId(null);
    setDraggedTaskId(null);

    if (!draggedTask || draggedTask.estadoId === estadoId) {
      return;
    }

    onStatusChange(draggedTask, estadoId);
  };

  return (
    <div className="kanban-board" ref={boardRef} style={boardStyle}>
      {COLUMNS.map(({ estadoId, label, accent, headerBg, headerBorder, countBg, countColor }) => {
        const cards = sortTareas(tareas.filter((t) => t.estadoId === estadoId));
        return (
          <div
            key={estadoId}
            className={`kanban-column kanban-column-drop-target ${dropEstadoId === estadoId ? "is-drop-active" : ""}`}
            onDragOver={(event) => handleColumnDragOver(estadoId, event)}
            onDragEnter={(event) => handleColumnDragOver(estadoId, event)}
            onDragLeave={() => {
              setDropEstadoId((current) => (current === estadoId ? null : current));
            }}
            onDrop={(event) => handleColumnDrop(estadoId, event)}
          >
            <div
              className="kanban-col-header"
              style={{ background: headerBg, borderBottomColor: headerBorder }}
            >
              <span className="kanban-col-label" style={{ color: accent }}>
                {label}
              </span>
              <span
                className="kanban-col-count"
                style={{ background: countBg, color: countColor }}
              >
                {cards.length}
              </span>
            </div>

            <div className="kanban-col-body">
              {cards.length === 0 ? (
                <p className="kanban-col-empty">Sin tareas</p>
              ) : (
                cards.map((t) => (
                  <TareaCard
                    key={t.taskId}
                    tarea={t}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onOpenDetails={onOpenDetails}
                    onDragStart={handleCardDragStart}
                    onDragEnd={handleCardDragEnd}
                    isDragging={draggedTaskId === t.taskId}
                    suppressClick={suppressClickTaskId === t.taskId}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
