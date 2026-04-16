import { useEffect, useMemo, useState } from "react";
import {
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useProjectSprints } from "@/features/proyectos/hooks/useProyectos";
import { useTaskPriorities } from "@/features/taskPriorities/taskPriorities/hooks/useTaskPriorities";
import { useTaskStatuses } from "@/features/taskStatuses/hooks/useTaskStatuses";
import { useUsers } from "@/features/users/hooks/useUsers";
import type { TaskStatus } from "@/features/taskStatuses/types/taskStatus";
import {
  useAssignTaskUser,
  useRemoveTaskUser,
  useTareaById,
  useTaskUsers,
  useUpdateTarea,
  useUpdateTareaStatus,
} from "@/features/tareas/hooks/useTareas";
import type { TaskPriority } from "@/features/taskPriorities/taskPriorities/types/taskPriority";
import type { UpdateTareaRequest } from "@/features/tareas/types/tarea";

const formatDisplayDateTime = (value: string | null) => {
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

const toDateTimeLocalValue = (value: string | null) => {
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

const toApiDateTime = (value: string) => (value.length === 16 ? `${value}:00` : value);

const normalizeId = (value: string | null | undefined) =>
  (value || "").replace(/-/g, "").toLowerCase();

const FALLBACK_STATUSES: Array<{ id: number; nombre: string }> = [
  { id: 1, nombre: "Pendiente" },
  { id: 2, nombre: "En progreso" },
  { id: 3, nombre: "Completada" },
  { id: 4, nombre: "Cancelada" },
];

const resolvePriorityId = (priority: TaskPriority) => {
  const withAlternativeId = priority as TaskPriority & { id?: number };
  const id = withAlternativeId.prioridadId ?? withAlternativeId.id;
  return typeof id === "number" ? id : null;
};

const resolveStatusId = (status: TaskStatus) => {
  const withAlternativeId = status as TaskStatus & { estadoId?: number };
  const id = withAlternativeId.id ?? withAlternativeId.estadoId;
  return typeof id === "number" ? id : null;
};

interface TaskEditFormState {
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  prioridadId: string;
  estadoId: string;
  sprintId: string;
  tiempoEstimado: string;
  tiempoReal: string;
}

const EMPTY_FORM: TaskEditFormState = {
  titulo: "",
  descripcion: "",
  fechaLimite: "",
  prioridadId: "",
  estadoId: "",
  sprintId: "",
  tiempoEstimado: "",
  tiempoReal: "",
};

interface TareasModalProps {
  taskId: string | null;
  projectId?: string;
  onClose: () => void;
}

export const TareasModal = ({ taskId, projectId, onClose }: TareasModalProps) => {
  const [form, setForm] = useState<TaskEditFormState>(EMPTY_FORM);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const {
    data: tareaDetalle,
    isLoading: detailLoading,
    isError: detailError,
    refetch: refetchTaskDetail,
  } = useTareaById(taskId ?? undefined);
  const {
    data: taskAssignments,
    isLoading: assigneesLoading,
    isError: assigneesError,
    refetch: refetchTaskUsers,
  } = useTaskUsers(taskId ?? undefined);
  const { data: rawTaskPriorities, isLoading: prioritiesLoading } = useTaskPriorities();
  const { data: taskStatuses = [], isLoading: statusesLoading } = useTaskStatuses();
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: sprints = [], isLoading: sprintsLoading } = useProjectSprints(projectId);

  const updateTareaMutation = useUpdateTarea(projectId);
  const updateStatusMutation = useUpdateTareaStatus(projectId);
  const assignTaskUserMutation = useAssignTaskUser(projectId);
  const removeTaskUserMutation = useRemoveTaskUser(projectId);

  const taskPriorities = useMemo(
    () =>
      (rawTaskPriorities || [])
        .map((priority) => {
          const prioridadId = resolvePriorityId(priority);

          if (prioridadId === null) {
            return null;
          }

          return {
            prioridadId,
            nombre: priority.nombre,
          };
        })
        .filter((priority): priority is { prioridadId: number; nombre: string } => priority !== null),
    [rawTaskPriorities]
  );

  const statusOptions = useMemo(() => {
    const fromApi = (taskStatuses || [])
      .map((status) => {
        const id = resolveStatusId(status);

        if (id === null) {
          return null;
        }

        return {
          id,
          nombre: status.nombre,
        };
      })
      .filter((status): status is { id: number; nombre: string } => status !== null);

    if (fromApi.length === 0) {
      return FALLBACK_STATUSES;
    }

    const existingIds = new Set(fromApi.map((status) => status.id));
    const missingFallbacks = FALLBACK_STATUSES.filter((status) => !existingIds.has(status.id));

    return [...fromApi, ...missingFallbacks];
  }, [taskStatuses]);

  const assignedUsers = (taskAssignments || []).map((assignment) => ({
    userId: assignment.userId,
    normalizedUserId: normalizeId(assignment.userId),
    nombre: assignment.nombre,
  }));

  const availableUsers = useMemo(() => {
    const assignedUserIds = new Set(assignedUsers.map((assignedUser) => assignedUser.normalizedUserId));
    return users.filter((user) => !assignedUserIds.has(normalizeId(user.userId)));
  }, [assignedUsers, users]);

  const isOpen = Boolean(taskId);
  const isSaving = updateTareaMutation.isPending || updateStatusMutation.isPending;

  useEffect(() => {
    if (!tareaDetalle) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      titulo: tareaDetalle.titulo || "",
      descripcion: tareaDetalle.descripcion || "",
      fechaLimite: toDateTimeLocalValue(tareaDetalle.fechaLimite),
      prioridadId: String(tareaDetalle.prioridadId),
      estadoId: String(tareaDetalle.estadoId),
      sprintId: tareaDetalle.sprintId || "",
      tiempoEstimado: tareaDetalle.tiempoEstimado === null ? "" : String(tareaDetalle.tiempoEstimado),
      tiempoReal: tareaDetalle.tiempoReal === null ? "" : String(tareaDetalle.tiempoReal),
    });

    setSaveFeedback(null);
    setSaveError(null);
    setAssignError(null);
    setSelectedUserId("");
    setRemovingUserId(null);
  }, [tareaDetalle]);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    const userStillAvailable = availableUsers.some((user) => user.userId === selectedUserId);

    if (!userStillAvailable) {
      setSelectedUserId("");
    }
  }, [availableUsers, selectedUserId]);

  const handleFormValueChange =
    (field: keyof TaskEditFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSaveChanges = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!taskId || !tareaDetalle) {
      return;
    }

    setSaveFeedback(null);
    setSaveError(null);

    if (!form.titulo.trim() || !form.fechaLimite || !form.prioridadId || !form.estadoId) {
      setSaveError("Completa título, fecha límite, prioridad y estado para guardar.");
      return;
    }

    const parsedPrioridadId = Number(form.prioridadId);
    const parsedEstadoId = Number(form.estadoId);
    const parsedTiempoEstimado = form.tiempoEstimado.trim() === "" ? null : Number(form.tiempoEstimado);
    const parsedTiempoReal = form.tiempoReal.trim() === "" ? null : Number(form.tiempoReal);

    if (!Number.isFinite(parsedPrioridadId) || !Number.isFinite(parsedEstadoId)) {
      setSaveError("Prioridad o estado inválidos.");
      return;
    }

    if ((parsedTiempoEstimado !== null && !Number.isFinite(parsedTiempoEstimado)) ||
      (parsedTiempoReal !== null && !Number.isFinite(parsedTiempoReal))) {
      setSaveError("Tiempo estimado y tiempo real deben ser valores numéricos.");
      return;
    }

    if ((parsedTiempoEstimado !== null && parsedTiempoEstimado < 0) ||
      (parsedTiempoReal !== null && parsedTiempoReal < 0)) {
      setSaveError("Tiempo estimado y tiempo real no pueden ser negativos.");
      return;
    }

    const payload: UpdateTareaRequest = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      fechaLimite: toApiDateTime(form.fechaLimite),
      prioridadId: parsedPrioridadId,
      sprintId: form.sprintId || undefined,
      tiempoEstimado: parsedTiempoEstimado,
      tiempoReal: parsedTiempoReal,
    };

    try {
      await updateTareaMutation.mutateAsync({ taskId, data: payload });

      if (parsedEstadoId !== tareaDetalle.estadoId) {
        await updateStatusMutation.mutateAsync({ taskId, estadoId: parsedEstadoId });
      }

      await Promise.all([refetchTaskDetail(), refetchTaskUsers()]);
      setSaveFeedback("Tarea actualizada correctamente.");
    } catch {
      setSaveError("No se pudo actualizar la tarea. Intenta nuevamente.");
    }
  };

  const handleAssignUser = async () => {
    if (!taskId || !selectedUserId) {
      return;
    }

    setAssignError(null);

    try {
      await assignTaskUserMutation.mutateAsync({ taskId, userId: selectedUserId });
      await refetchTaskUsers();
      setSelectedUserId("");
    } catch {
      setAssignError("No se pudo asignar el usuario seleccionado.");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!taskId) {
      return;
    }

    setAssignError(null);
    setRemovingUserId(userId);

    try {
      await removeTaskUserMutation.mutateAsync({ taskId, userId });
      await refetchTaskUsers();
    } catch {
      setAssignError("No se pudo remover el usuario seleccionado.");
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <aside
      className={`tareas-side-modal ${isOpen ? "tareas-side-modal--open" : ""}`}
      aria-hidden={!isOpen}
      aria-label="Detalle de tarea"
    >
      <div className="tareas-side-modal-inner">
        <div className="tareas-side-modal-header">
          <div>
            <span className="task-detail-label">Detalle de tarea</span>
            <h3 className="tareas-side-modal-title">
              {tareaDetalle ? tareaDetalle.titulo : "Selecciona una tarea"}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="app-modal-close-btn" aria-label="Cerrar panel">
            <CloseIcon />
          </button>
        </div>

        <div className="tareas-side-modal-body">
          {!isOpen ? (
            <p className="task-detail-empty">Selecciona una tarea para ver su detalle.</p>
          ) : detailLoading ? (
            <div className="task-detail-loading">
              <CircularProgress size={28} />
            </div>
          ) : detailError || !tareaDetalle ? (
            <p className="task-detail-feedback">
              No se pudieron cargar los detalles de la tarea seleccionada.
            </p>
          ) : (
            <div className="task-detail-content">
              <form className="task-edit-form" onSubmit={handleSaveChanges}>
                <TextField
                  name="titulo"
                  label="Título"
                  size="small"
                  fullWidth
                  required
                  value={form.titulo}
                  onChange={handleFormValueChange("titulo")}
                />

                <TextField
                  name="descripcion"
                  label="Descripción"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  value={form.descripcion}
                  onChange={handleFormValueChange("descripcion")}
                />

                <div className="task-edit-grid">
                  <TextField
                    name="fechaLimite"
                    label="Fecha límite"
                    type="datetime-local"
                    size="small"
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.fechaLimite}
                    onChange={handleFormValueChange("fechaLimite")}
                  />

                  <FormControl size="small" required>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      label="Prioridad"
                      value={form.prioridadId}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        prioridadId: event.target.value as string,
                      }))}
                    >
                      {prioritiesLoading && (
                        <MenuItem value="" disabled>Cargando prioridades...</MenuItem>
                      )}

                      {taskPriorities.map((priority) => (
                        <MenuItem key={priority.prioridadId} value={String(priority.prioridadId)}>
                          {priority.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" required>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      label="Estado"
                      value={form.estadoId}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        estadoId: event.target.value as string,
                      }))}
                    >
                      {statusesLoading && (
                        <MenuItem value="" disabled>Cargando estados...</MenuItem>
                      )}

                      {statusOptions.map((status) => (
                        <MenuItem key={status.id} value={String(status.id)}>
                          {status.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" disabled={!projectId}>
                    <InputLabel>Sprint</InputLabel>
                    <Select
                      label="Sprint"
                      value={form.sprintId}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        sprintId: event.target.value as string,
                      }))}
                    >
                      <MenuItem value="">Sin sprint</MenuItem>

                      {sprintsLoading && (
                        <MenuItem value="" disabled>Cargando sprints...</MenuItem>
                      )}

                      {sprints.map((sprint) => (
                        <MenuItem key={sprint.sprintId} value={sprint.sprintId}>
                          {sprint.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    name="tiempoEstimado"
                    label="Tiempo estimado (hrs)"
                    type="number"
                    size="small"
                    slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                    value={form.tiempoEstimado}
                    onChange={handleFormValueChange("tiempoEstimado")}
                  />

                  <TextField
                    name="tiempoReal"
                    label="Tiempo real (hrs)"
                    type="number"
                    size="small"
                    slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                    value={form.tiempoReal}
                    onChange={handleFormValueChange("tiempoReal")}
                  />
                </div>

                <div className="task-detail-section">
                  <span className="task-detail-label">Fechas del sistema</span>
                  <div className="task-system-meta">
                    <p className="task-detail-description">
                      Creada: {formatDisplayDateTime(tareaDetalle.fechaCreacion)}
                    </p>
                    <p className="task-detail-description">
                      Finalizada: {formatDisplayDateTime(tareaDetalle.fechaFinalizacion)}
                    </p>
                  </div>
                </div>

                {saveError && <p className="task-form-feedback task-form-feedback--error">{saveError}</p>}
                {saveFeedback && <p className="task-form-feedback task-form-feedback--success">{saveFeedback}</p>}

                <div className="task-edit-actions">
                  <Button type="submit" className="AddButton" disabled={isSaving}>
                    {isSaving ? <CircularProgress size={18} /> : "Guardar cambios"}
                  </Button>
                </div>
              </form>

              <div className="task-detail-section">
                <span className="task-detail-label">Usuarios asignados</span>

                <div className="task-assignee-toolbar">
                  <FormControl size="small" fullWidth>
                    <InputLabel>Asignar usuario</InputLabel>
                    <Select
                      label="Asignar usuario"
                      value={selectedUserId}
                      disabled={usersLoading || availableUsers.length === 0 || assignTaskUserMutation.isPending}
                      onChange={(event) => setSelectedUserId(event.target.value as string)}
                    >
                      {availableUsers.length === 0 ? (
                        <MenuItem value="" disabled>
                          No hay usuarios disponibles
                        </MenuItem>
                      ) : (
                        availableUsers.map((user) => (
                          <MenuItem key={user.userId} value={user.userId}>
                            {user.primerNombre} {user.apellido}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>

                  <Button
                    type="button"
                    className="AddButton"
                    disabled={!selectedUserId || assignTaskUserMutation.isPending}
                    onClick={handleAssignUser}
                  >
                    {assignTaskUserMutation.isPending ? <CircularProgress size={18} /> : "Asignar"}
                  </Button>
                </div>

                {assignError && <p className="task-form-feedback task-form-feedback--error">{assignError}</p>}

                {assigneesLoading ? (
                  <div className="task-assignees-loading">
                    <CircularProgress size={22} />
                  </div>
                ) : assigneesError ? (
                  <p className="task-detail-feedback">No se pudieron cargar los usuarios asignados.</p>
                ) : assignedUsers.length === 0 ? (
                  <p className="task-detail-empty">Esta tarea no tiene usuarios asignados.</p>
                ) : (
                  <ul className="task-assignee-list">
                    {assignedUsers.map((assigned) => (
                      <li key={assigned.userId} className="task-assignee-item">
                        <span className="task-detail-value">{assigned.nombre || assigned.userId}</span>
                        <button
                          type="button"
                          className="task-assignee-remove-btn"
                          title="Remover usuario"
                          aria-label={`Remover ${assigned.nombre || assigned.userId}`}
                          disabled={removeTaskUserMutation.isPending && removingUserId === assigned.userId}
                          onClick={() => handleRemoveUser(assigned.userId)}
                        >
                          <DeleteIcon />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
