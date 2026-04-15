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
}

function TareaCard({ tarea, onDelete, onStatusChange }: TareaCardProps) {
  const p = PRIO[tarea.prioridadId] || { label: "—", bg: "#E4E4E7", color: "#52525B" };
  const done = tarea.estadoId === 3;

  return (
    <div className="tarea-card">
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
          onClick={() => onStatusChange(tarea, done ? 1 : 3)}
          style={{ fontSize: "11px", padding: "2px 8px", minWidth: 0 }}
        >
          {done ? "Reabrir" : "Completar"}
        </Button>
        <button
          onClick={() => onDelete(tarea.taskId)}
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
}

export const TareaList = ({ tareas, onDelete, onStatusChange }: TareaListProps) => {
  if (!tareas || tareas.length === 0)
    return <p className="kanban-empty">No hay tareas registradas</p>;

  return (
    <div className="kanban-board">
      {COLUMNS.map(({ estadoId, label, accent, headerBg, headerBorder, countBg, countColor }) => {
        const cards = sortTareas(tareas.filter((t) => t.estadoId === estadoId));
        return (
          <div key={estadoId} className="kanban-column">
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
