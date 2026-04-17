import {
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { TareaEditFormSectionProps } from "@/features/tareas/components/tareasModal/types";
import { formatDisplayDateTime } from "@/features/tareas/components/tareasModal/tareasModalUtils";

export const TareaEditFormSection = ({
  form,
  projectId,
  sprints,
  sprintsLoading,
  prioritiesLoading,
  statusesLoading,
  taskPriorities,
  statusOptions,
  saveError,
  saveFeedback,
  isSaving,
  fechaCreacion,
  fechaFinalizacion,
  onSubmit,
  onFieldChange,
}: TareaEditFormSectionProps) => {
  return (
    <form className="task-edit-form" onSubmit={onSubmit}>
      <TextField
        name="titulo"
        label="Título"
        size="small"
        fullWidth
        required
        value={form.titulo}
        onChange={(event) => onFieldChange("titulo", event.target.value)}
      />

      <TextField
        name="descripcion"
        label="Descripción"
        size="small"
        fullWidth
        multiline
        rows={3}
        value={form.descripcion}
        onChange={(event) => onFieldChange("descripcion", event.target.value)}
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
          onChange={(event) => onFieldChange("fechaLimite", event.target.value)}
        />

        <FormControl size="small" required>
          <InputLabel>Prioridad</InputLabel>
          <Select
            label="Prioridad"
            value={form.prioridadId}
            onChange={(event) => onFieldChange("prioridadId", event.target.value as string)}
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
            onChange={(event) => onFieldChange("estadoId", event.target.value as string)}
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
            onChange={(event) => onFieldChange("sprintId", event.target.value as string)}
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
          onChange={(event) => onFieldChange("tiempoEstimado", event.target.value)}
        />

        <TextField
          name="tiempoReal"
          label="Tiempo real (hrs)"
          type="number"
          size="small"
          slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
          value={form.tiempoReal}
          onChange={(event) => onFieldChange("tiempoReal", event.target.value)}
        />
      </div>

      <div className="task-detail-section">
        <span className="task-detail-label">Fechas del sistema</span>
        <div className="task-system-meta">
          <p className="task-detail-description">
            Creada: {formatDisplayDateTime(fechaCreacion)}
          </p>
          <p className="task-detail-description">
            Finalizada: {formatDisplayDateTime(fechaFinalizacion)}
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
  );
};
