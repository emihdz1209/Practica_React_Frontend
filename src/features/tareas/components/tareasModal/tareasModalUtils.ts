import type { TaskPriority } from "@/features/taskPriorities/taskPriorities/types/taskPriority";
import type { TaskStatus } from "@/features/taskStatuses/types/taskStatus";

export const formatDisplayDateTime = (value: string | null) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const toDateTimeLocalValue = (value: string | null) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 16);
  }

  const shifted = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
};

export const toApiDateTime = (value: string) => (value.length === 16 ? `${value}:00` : value);

export const normalizeId = (value: string | null | undefined) =>
  (value || "").replace(/-/g, "").toLowerCase();

export const FALLBACK_STATUSES: Array<{ id: number; nombre: string }> = [
  { id: 1, nombre: "Pendiente" },
  { id: 2, nombre: "En progreso" },
  { id: 3, nombre: "Completada" },
  { id: 4, nombre: "Cancelada" },
];

export const resolvePriorityId = (priority: TaskPriority) => {
  const withAlternativeId = priority as TaskPriority & { id?: number };
  const id = withAlternativeId.prioridadId ?? withAlternativeId.id;
  return typeof id === "number" ? id : null;
};

export const resolveStatusId = (status: TaskStatus) => {
  const withAlternativeId = status as TaskStatus & { estadoId?: number };
  const id = withAlternativeId.id ?? withAlternativeId.estadoId;
  return typeof id === "number" ? id : null;
};
