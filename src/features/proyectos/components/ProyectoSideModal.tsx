import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUpdateProyecto, useDeleteProyecto } from "@/features/proyectos/hooks/useProyectos";
import type { Proyecto } from "@/features/proyectos/types/proyecto";
import styles from "@/features/proyectos/styles/ProyectoSideModal.module.css";

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
  dueDate: string;
  fechaInicioOriginal: string | null;
}

interface ProyectoEditFormProps {
  form: ProyectoFormState;
  isSaving: boolean;
  isDeleting: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onDelete: () => void;
  onCancel: () => void;
}

const ProyectoEditForm = ({
  form,
  isSaving,
  isDeleting,
  onChange,
  onSubmit,
  onDelete,
  onCancel,
}: ProyectoEditFormProps) => {
  return (
    <form onSubmit={onSubmit} className={styles.editForm}>
      <p className={styles.modalDescription}>
        Update project details and manage attached files.
      </p>

      <TextField
        name="nombre"
        label="Project name"
        value={form.nombre}
        onChange={onChange}
        required
        size="small"
        fullWidth
      />

      <TextField
        name="descripcion"
        label="Description"
        value={form.descripcion}
        onChange={onChange}
        multiline
        minRows={3}
        maxRows={10}
        size="small"
        fullWidth
      />

      <TextField
        name="dueDate"
        label="Due date"
        type="date"
        value={form.dueDate}
        onChange={onChange}
        size="small"
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <div className={styles.attachmentsSection}>
        <span className={styles.attachmentsTitle}>Attachments</span>

        <button type="button" className={styles.uploadBox}>
          <span className={styles.uploadIconWrap}>
            <img src="/upload.svg" alt="" aria-hidden="true" className={styles.uploadIcon} />
          </span>
          <p className={styles.uploadPrimaryText}>
            <strong>Click to upload</strong> or drag files here
          </p>
          <p className={styles.uploadSecondaryText}>PDF, images, or docs up to 20MB</p>
        </button>
      </div>

      <div className={styles.deleteActionRow}>
        <Button
          type="button"
          variant="outlined"
          color="error"
          fullWidth
          className={styles.deleteButton}
          onClick={onDelete}
          disabled={isDeleting}
          startIcon={<img src="/trash.svg" alt="" aria-hidden="true" className={styles.deleteIcon} />}
        >
          {isDeleting ? <CircularProgress size={16} /> : "Delete project"}
        </Button>
      </div>

      <div className={styles.editActions}>
        <Button
          type="button"
          variant="outlined"
          className={styles.cancelButton}
          onClick={onCancel}
          startIcon={<CloseIcon fontSize="small" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          className={styles.saveButton}
          disabled={isSaving}
        >
          {isSaving ? <CircularProgress size={18} /> : "Save changes"}
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

  const [form, setForm] = useState<ProyectoFormState>({
    nombre: "",
    descripcion: "",
    dueDate: "",
    fechaInicioOriginal: null,
  });

  const updateMutation = useUpdateProyecto(teamId);
  const deleteMutation = useDeleteProyecto(teamId);

  useEffect(() => {
    if (!project) {
      return;
    }

    setForm({
      nombre: project.nombre,
      descripcion: project.descripcion ?? "",
      dueDate: project.fechaFin ? project.fechaFin.slice(0, 10) : "",
      fechaInicioOriginal: project.fechaInicio,
    });
  }, [project]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
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
          fechaInicio: form.fechaInicioOriginal,
          fechaFin: form.dueDate ? `${form.dueDate}T00:00` : null,
        },
      },
      {
        onSuccess: () => onClose(),
      }
    );
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
              {project ? "Edit project" : "Select a project"}
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
            <p className="task-detail-empty">Select a project to view its details.</p>
          ) : canManageProjects ? (
            <ProyectoEditForm
              form={form}
              isSaving={updateMutation.isPending}
              isDeleting={deleteMutation.isPending}
              onChange={handleChange}
              onSubmit={handleSave}
              onDelete={handleDelete}
              onCancel={onClose}
            />
          ) : (
            <p className="task-detail-feedback">Only MANAGERS can edit projects.</p>
          )}
        </div>
      </div>
    </aside>
  );
};
