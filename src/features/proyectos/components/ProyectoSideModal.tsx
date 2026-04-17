import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import {
  useUpdateProyecto,
  useDeleteProyecto,
} from "@/features/proyectos/hooks/useProyectos";
import type { Proyecto } from "@/features/proyectos/types/proyecto";

const fmtDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-MX") : "—";

const toDatetimeLocal = (value: string | null): string => {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
};

const progressColor = (percentage: number) =>
  percentage >= 75 ? "#16A34A" : percentage >= 40 ? "#2563EB" : "#D97706";

interface SideModalProps {
  project: Proyecto | null;
  onClose: () => void;
  onProjectDeleted: (projectId: string) => void;
  teamId: string;
}

export const ProyectoSideModal = ({ project, onClose, onProjectDeleted, teamId }: SideModalProps) => {
  const isOpen = Boolean(project);

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const updateMutation = useUpdateProyecto(teamId);
  const deleteMutation = useDeleteProyecto(teamId);

  useEffect(() => {
    if (!project) {
      setEditing(false);
      setConfirmDelete(false);
      return;
    }

    setForm({
      nombre: project.nombre,
      descripcion: project.descripcion ?? "",
      fechaInicio: toDatetimeLocal(project.fechaInicio),
      fechaFin: toDatetimeLocal(project.fechaFin),
    });
    setEditing(false);
    setConfirmDelete(false);
  }, [project]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!project || !form.nombre.trim()) {
      return;
    }

    updateMutation.mutate(
      {
        projectId: project.projectId,
        data: {
          nombre: form.nombre,
          descripcion: form.descripcion,
          fechaInicio: form.fechaInicio || null,
          fechaFin: form.fechaFin || null,
        },
      },
      {
        onSuccess: () => setEditing(false),
      }
    );
  };

  const handleDelete = () => {
    if (!project) {
      return;
    }

    deleteMutation.mutate(project.projectId, {
      onSuccess: () => {
        onProjectDeleted(project.projectId);
        onClose();
      },
    });
  };

  const progress = project?.progreso ?? 0;

  return (
    <aside
      className={`tareas-side-modal ${isOpen ? "tareas-side-modal--open" : ""}`}
      aria-hidden={!isOpen}
      aria-label="Detalle de proyecto"
    >
      <div className="tareas-side-modal-inner">
        <div className="tareas-side-modal-header">
          <div>
            <span className="task-detail-label">Detalle de proyecto</span>
            <h3 className="tareas-side-modal-title">
              {project ? project.nombre : "Selecciona un proyecto"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-modal-close-btn"
            aria-label="Cerrar panel"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="tareas-side-modal-body">
          {!project ? (
            <p className="task-detail-empty">Selecciona un proyecto para ver su detalle.</p>
          ) : !editing ? (
            <div className="task-detail-content">
              <div className="task-detail-section">
                <span className="task-detail-label">Progreso</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <div className="progress-track" style={{ flex: 1 }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%`, background: progressColor(progress) }}
                    />
                  </div>
                  <span style={{ fontWeight: 700, color: progressColor(progress), minWidth: 36, fontSize: "0.88rem" }}>
                    {progress}%
                  </span>
                </div>
              </div>

              <div className="task-detail-section">
                <span className="task-detail-label">Descripción</span>
                <p className="task-detail-description" style={{ marginTop: 4 }}>
                  {project.descripcion || "Sin descripción"}
                </p>
              </div>

              <div className="task-detail-section">
                <span className="task-detail-label">Fechas</span>
                <div className="task-system-meta" style={{ marginTop: 4 }}>
                  <p className="task-detail-description">
                    Inicio: {fmtDate(project.fechaInicio)}
                  </p>
                  <p className="task-detail-description">
                    Fin: {fmtDate(project.fechaFin)}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditing(true)}
                  size="small"
                >
                  Editar
                </Button>

                {!confirmDelete ? (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setConfirmDelete(true)}
                    size="small"
                  >
                    Eliminar
                  </Button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>
                      ¿Confirmar eliminación?
                    </span>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? <CircularProgress size={14} /> : "Sí, eliminar"}
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="task-edit-form">
              <TextField
                name="nombre"
                label="Nombre del proyecto"
                value={form.nombre}
                onChange={handleChange}
                required
                size="small"
                fullWidth
              />
              <TextField
                name="descripcion"
                label="Descripción"
                value={form.descripcion}
                onChange={handleChange}
                multiline
                rows={3}
                size="small"
                fullWidth
              />
              <TextField
                name="fechaInicio"
                label="Fecha inicio"
                type="datetime-local"
                value={form.fechaInicio}
                onChange={handleChange}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                name="fechaFin"
                label="Fecha fin"
                type="datetime-local"
                value={form.fechaFin}
                onChange={handleChange}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Tooltip title="Cancelar edición">
                  <IconButton onClick={() => setEditing(false)} size="small">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  type="submit"
                  className="AddButton"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <CircularProgress size={18} /> : "Guardar cambios"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
};
