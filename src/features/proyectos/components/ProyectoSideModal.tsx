import { useEffect, useState } from "react";
import { TextField, Button, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import {
  useUpdateProyecto,
  useDeleteProyecto,
  useProjectDocuments,
  useUploadProjectDocument,
  useDeleteProjectDocument,
} from "@/features/proyectos/hooks/useProyectos";
import type { Proyecto, ProjectDocument } from "@/features/proyectos/types/proyecto";
import styles from "@/features/proyectos/styles/ProyectoSideModal.module.css";

/**
 * Format file size in human-readable format (B, KB, MB, etc.)
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, index)).toFixed(0);
  return `${size} ${units[index]}`;
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
  // Attachments
  documents?: ProjectDocument[];
  isDocsLoading?: boolean;
  onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument?: (documentId: string) => void;
  isDeletingDocument?: boolean;
}

const ProyectoEditForm = ({
  form,
  isSaving,
  isDeleting,
  onChange,
  onSubmit,
  onDelete,
  onCancel,
  // attachments props
  documents = [],
  isDocsLoading = false,
  onFileChange,
  onDeleteDocument,
  isDeletingDocument = false,
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

        <input
          type="file"
          accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: "none" }}
          onChange={onFileChange}
          id="project-file-input"
        />

        <button
          type="button"
          className={styles.uploadBox}
          onClick={() => document.getElementById("project-file-input")?.click()}
        >
          <span className={styles.uploadIconWrap}>
            <img src="/upload.svg" alt="" aria-hidden="true" className={styles.uploadIcon} />
          </span>
          <p className={styles.uploadPrimaryText}>
            <strong>Click to upload</strong> or drag files here
          </p>
          <p className={styles.uploadSecondaryText}>PDF, images, or docs up to 20MB</p>
        </button>

        {/* No document type field per design; upload triggers automatically on file select */}

        <div className={styles.documentsList}>
          {isDocsLoading ? (
            <CircularProgress size={18} />
          ) : documents && documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc.documentId} className={styles.documentRow}>
                <img src="/file-description.svg" alt="" className={styles.documentIcon} />
                <div className={styles.documentInfo}>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className={styles.documentLink}>
                    {doc.fileName}
                  </a>
                  <div className={styles.documentMeta}>
                    {typeof doc.fileSizeBytes === "number" ? formatFileSize(doc.fileSizeBytes) : ""}
                  </div>
                </div>
                <IconButton
                  size="small"
                  aria-label="delete-attachment"
                  title="Delete attachment"
                  onClick={() => onDeleteDocument?.(doc.documentId)}
                  disabled={isDeletingDocument}
                >
                  <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
                </IconButton>
              </div>
            ))
          ) : (
            <div className={styles.noDocuments}>
              No documents attached for this project.
            </div>
          )}
        </div>
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
          sx={{ padding: "6px 16px", height: "auto" }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          className={styles.saveButton}
          disabled={isSaving}
          sx={{ padding: "6px 16px", height: "auto" }}
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

  // Documents upload/list state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmDeleteDocumentId, setConfirmDeleteDocumentId] = useState<string | null>(null);

  const documentsQuery = useProjectDocuments(project?.projectId);
  const uploadMutation = useUploadProjectDocument(project?.projectId);
  const deleteDocumentMutation = useDeleteProjectDocument(project?.projectId);

  useEffect(() => {
    if (project?.projectId) {
      documentsQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.projectId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  // Auto-upload when a file is selected (send default documentType 'OTHER')
  useEffect(() => {
    if (!selectedFile || !project) return;

    // Validate size 20MB
    if (selectedFile.size > 20 * 1024 * 1024) {
      alert("File is too large. Maximum allowed size is 20MB.");
      setSelectedFile(null);
      return;
    }

    uploadMutation.mutate({ file: selectedFile, documentType: "OTHER" }, {
      onSuccess: () => {
        setSelectedFile(null);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, project?.projectId]);

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

  const handleDeleteDocument = (documentId: string) => {
    setConfirmDeleteDocumentId(documentId);
  };

  const handleConfirmDeleteDocument = () => {
    if (!confirmDeleteDocumentId) return;
    deleteDocumentMutation.mutate(confirmDeleteDocumentId, {
      onSuccess: () => {
        setConfirmDeleteDocumentId(null);
      },
    });
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
              documents={documentsQuery.data}
              isDocsLoading={documentsQuery.isLoading}
              onFileChange={handleFileChange}
              onDeleteDocument={handleDeleteDocument}
              isDeletingDocument={deleteDocumentMutation.isPending}
            />
          ) : (
            <p className="task-detail-feedback">Only MANAGERS can edit projects.</p>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(confirmDeleteDocumentId)}
        onClose={() => setConfirmDeleteDocumentId(null)}
        aria-labelledby="delete-document-dialog-title"
      >
        <DialogTitle id="delete-document-dialog-title">Delete Document</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this document? This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDocumentId(null)}>Cancel</Button>
          <Button
            onClick={handleConfirmDeleteDocument}
            color="error"
            variant="contained"
            disabled={deleteDocumentMutation.isPending}
          >
            {deleteDocumentMutation.isPending ? <CircularProgress size={18} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </aside>
  );
};
