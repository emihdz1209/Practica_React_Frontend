import { CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTareaById, useTaskUsers } from "@/features/tareas/hooks/useTareas";

const PRIORIDADES = [
  { prioridadId: 1, nombre: "Alta" },
  { prioridadId: 2, nombre: "Media" },
  { prioridadId: 3, nombre: "Baja" },
];

const ESTADOS: Record<number, string> = {
  1: "Pendiente",
  2: "En Proceso",
  3: "Completada",
  4: "Cancelada",
};

const formatDateTime = (value: string | null) => {
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

const formatHours = (value: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? `${value} h` : "—";

interface TareasModalProps {
  taskId: string | null;
  onClose: () => void;
}

export const TareasModal = ({ taskId, onClose }: TareasModalProps) => {
  const {
    data: tareaDetalle,
    isLoading: detailLoading,
    isError: detailError,
  } = useTareaById(taskId ?? undefined);
  const {
    data: taskAssignments,
    isLoading: assigneesLoading,
    isError: assigneesError,
  } = useTaskUsers(taskId ?? undefined);

  const assignedUsers = (taskAssignments || []).map((assignment) => ({
    userId: assignment.userId,
    nombre: assignment.nombre,
  }));

  const isOpen = Boolean(taskId);

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
              <div className="task-detail-grid">
                <div className="task-detail-item">
                  <span className="task-detail-label">Estado</span>
                  <span className="task-detail-value">
                    {ESTADOS[tareaDetalle.estadoId] || `Estado ${tareaDetalle.estadoId}`}
                  </span>
                </div>
                <div className="task-detail-item">
                  <span className="task-detail-label">Prioridad</span>
                  <span className="task-detail-value">
                    {PRIORIDADES.find((p) => p.prioridadId === tareaDetalle.prioridadId)?.nombre ||
                      `Prioridad ${tareaDetalle.prioridadId}`}
                  </span>
                </div>
                <div className="task-detail-item">
                  <span className="task-detail-label">Creada</span>
                  <span className="task-detail-value">{formatDateTime(tareaDetalle.fechaCreacion)}</span>
                </div>
                <div className="task-detail-item">
                  <span className="task-detail-label">Fecha limite</span>
                  <span className="task-detail-value">{formatDateTime(tareaDetalle.fechaLimite)}</span>
                </div>
                <div className="task-detail-item">
                  <span className="task-detail-label">Finalizada</span>
                  <span className="task-detail-value">{formatDateTime(tareaDetalle.fechaFinalizacion)}</span>
                </div>
                <div className="task-detail-item">
                  <span className="task-detail-label">Tiempo estimado</span>
                  <span className="task-detail-value">{formatHours(tareaDetalle.tiempoEstimado)}</span>
                </div>
                <div className="task-detail-item">
                  <span className="task-detail-label">Tiempo real</span>
                  <span className="task-detail-value">{formatHours(tareaDetalle.tiempoReal)}</span>
                </div>
                <div className="task-detail-item">
                  <span className="task-detail-label">Sprint</span>
                  <span className="task-detail-value">{tareaDetalle.sprintNombre || "—"}</span>
                </div>
              </div>

              <div className="task-detail-section">
                <span className="task-detail-label">Descripcion</span>
                <p className="task-detail-description">{tareaDetalle.descripcion || "—"}</p>
              </div>

              <div className="task-detail-section">
                <span className="task-detail-label">Usuarios asignados</span>

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
                        <span className="task-detail-value">{assigned.nombre}</span>
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
