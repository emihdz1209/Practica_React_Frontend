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
import styles from "@/features/proyectos/styles/ProyectoSideModal.module.css";

const fmtDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-MX") : "—";

const toDatetimeLocal = (value: string | null): string => {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
};

interface SideModalProps {
  project: Proyecto | null;
  onClose: () => void;
  onProjectDeleted: (projectId: string) => void;
  teamId: string;
  canManageProjects: boolean;
}

interface ProyectoFormState {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
}

interface ProyectoViewContentProps {
  project: Proyecto;
  canManageProjects: boolean;
  confirmDelete: boolean;
  isDeleting: boolean;
  onStartEdit: () => void;
  onStartDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}

const ProyectoViewContent = ({
  project,
  canManageProjects,
  confirmDelete,
  isDeleting,
  onStartEdit,
  onStartDelete,
  onCancelDelete,
  onDelete,
}: ProyectoViewContentProps) => {
  return (
    <div className="task-detail-content">
      <div className="task-detail-section">
        <span className="task-detail-label">Descripción</span>
        <p className={`task-detail-description ${styles.description}`}>
          {project.descripcion || "Sin descripción"}
        </p>
      </div>

      <div className="task-detail-section">
        <span className="task-detail-label">Fechas</span>
        <div className={`task-system-meta ${styles.systemMeta}`}>
          <p className="task-detail-description">
            Inicio: {fmtDate(project.fechaInicio)}
          </p>
          <p className="task-detail-description">
            Fin: {fmtDate(project.fechaFin)}
          </p>
        </div>
      </div>

      <div className={styles.actionsRow}>
        {canManageProjects ? (
          <>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onStartEdit}
              size="small"
            >
              Editar
            </Button>

            {!confirmDelete ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onStartDelete}
                size="small"
              >
                Eliminar
              </Button>
            ) : (
              <div className={styles.deleteConfirmRow}>
                <span className={styles.deleteConfirmText}>¿Confirmar eliminación?</span>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <CircularProgress size={14} /> : "Sí, eliminar"}
                </Button>
                <Button variant="text" size="small" onClick={onCancelDelete}>
                  Cancelar
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="task-detail-feedback">
            Solo MANAGERS pueden editar o eliminar proyectos.
          </p>
        )}
      </div>
    </div>
  );
};

interface ProyectoEditFormProps {
  form: ProyectoFormState;
  isSaving: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

const ProyectoEditForm = ({
  form,
  isSaving,
  onChange,
  onSubmit,
  onCancel,
}: ProyectoEditFormProps) => {
  return (
    <form onSubmit={onSubmit} className="task-edit-form">
      <TextField
        name="nombre"
        label="Nombre del proyecto"
        value={form.nombre}
        onChange={onChange}
        required
        size="small"
        fullWidth
      />
      <TextField
        name="descripcion"
        label="Descripción"
        value={form.descripcion}
        onChange={onChange}
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
        onChange={onChange}
        size="small"
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        name="fechaFin"
        label="Fecha fin"
        type="datetime-local"
        value={form.fechaFin}
        onChange={onChange}
        size="small"
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <div className={styles.editActions}>
        <Tooltip title="Cancelar edición">
          <IconButton onClick={onCancel} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Button
          type="submit"
          className="AddButton"
          disabled={isSaving}
        >
          {isSaving ? <CircularProgress size={18} /> : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
};

export const ProyectoSideModal = ({
  project,
  onClose,
  onProjectDeleted,
  teamId,
  canManageProjects,
}: SideModalProps) => {
  const isOpen = Boolean(project);

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<ProyectoFormState>({
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
    if (!canManageProjects || !project || !form.nombre.trim()) {
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
    if (!canManageProjects || !project) {
      return;
    }

    deleteMutation.mutate(project.projectId, {
      onSettled: () => {
        onProjectDeleted(project.projectId);
        onClose();
      },
    });
  };

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
          ) : editing && canManageProjects ? (
            <ProyectoEditForm
              form={form}
              isSaving={updateMutation.isPending}
              onChange={handleChange}
              onSubmit={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <ProyectoViewContent
              project={project}
              canManageProjects={canManageProjects}
              confirmDelete={confirmDelete}
              isDeleting={deleteMutation.isPending}
              onStartEdit={() => setEditing(true)}
              onStartDelete={() => setConfirmDelete(true)}
              onCancelDelete={() => setConfirmDelete(false)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </aside>
  );
};
