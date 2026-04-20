import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useProjectSprints } from "@/features/proyectos/hooks/useProyectos";
import { useTaskPriorities } from "@/features/taskPriorities/taskPriorities/hooks/useTaskPriorities";
import { useTaskStatuses } from "@/features/taskStatuses/hooks/useTaskStatuses";
import { useUsers } from "@/features/users/hooks/useUsers";
import {
  useAssignTaskUser,
  useRemoveTaskUser,
  useTareaById,
  useTaskUsers,
  useUpdateTarea,
  useUpdateTareaStatus,
} from "@/features/tareas/hooks/useTareas";
import type { UpdateTareaRequest } from "@/features/tareas/types/tarea";
import { TareaEditFormSection } from "@/features/tareas/components/tareasModal/TareaEditFormSection";
import { TaskAssigneesSection } from "@/features/tareas/components/tareasModal/TaskAssigneesSection";
import {
  EMPTY_FORM,
  type TaskEditFormState,
} from "@/features/tareas/components/tareasModal/types";
import {
  FALLBACK_STATUSES,
  normalizeId,
  resolvePriorityId,
  resolveStatusId,
  toApiDateTime,
  toDateTimeLocalValue,
} from "@/features/tareas/components/tareasModal/tareasModalUtils";

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

  const handleFormValueChange = (field: keyof TaskEditFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
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
              <TareaEditFormSection
                form={form}
                projectId={projectId}
                sprints={sprints}
                sprintsLoading={sprintsLoading}
                prioritiesLoading={prioritiesLoading}
                statusesLoading={statusesLoading}
                taskPriorities={taskPriorities}
                statusOptions={statusOptions}
                saveError={saveError}
                saveFeedback={saveFeedback}
                isSaving={isSaving}
                fechaCreacion={tareaDetalle.fechaCreacion}
                fechaFinalizacion={tareaDetalle.fechaFinalizacion}
                onSubmit={handleSaveChanges}
                onFieldChange={handleFormValueChange}
              />

              <TaskAssigneesSection
                availableUsers={availableUsers}
                selectedUserId={selectedUserId}
                assignError={assignError}
                assigneesLoading={assigneesLoading}
                assigneesError={assigneesError}
                usersLoading={usersLoading}
                isAssigning={assignTaskUserMutation.isPending}
                isRemoving={removeTaskUserMutation.isPending}
                removingUserId={removingUserId}
                assignedUsers={assignedUsers}
                onAssignUser={handleAssignUser}
                onSelectUser={setSelectedUserId}
                onRemoveUser={handleRemoveUser}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};