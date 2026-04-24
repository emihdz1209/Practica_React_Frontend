import React, { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";

interface Prioridad {
  prioridadId: number;
  nombre: string;
}

interface ProjectOption {
  projectId: string;
  nombre: string;
}

interface Props {
  onSubmit: (data: {
    projectId: string;
    titulo: string;
    descripcion: string;
    fechaLimite: string;
    prioridadId: number;
    tiempoEstimado: number | null;
  }) => void;
  isPending: boolean;
  projects: ProjectOption[];
  prioridades: Prioridad[];
  submitError?: string | null;
  onClearSubmitError?: () => void;
}

const getDefaultFechaLimite = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T17:00`;
};

const getTodayDateValue = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getMinFechaLimite = () => `${getTodayDateValue()}T00:00`;

const EMPTY = {
  projectId: "",
  titulo: "",
  descripcion: "",
  fechaLimite: "",
  tiempoEstimado: "",
  prioridadId: "",
};

const MAX_ESTIMATED_HOURS = 48;
const ESTIMATED_HOURS_ERROR_MESSAGE =
  `El tiempo estimado debe estar entre 0 y ${MAX_ESTIMATED_HOURS} horas.`;
const DEADLINE_ERROR_MESSAGE = "La fecha límite no puede ser anterior al día de hoy.";

export const CreateTareaForm = ({
  onSubmit,
  isPending,
  projects,
  prioridades,
  submitError,
  onClearSubmitError,
}: Props) => {
  const minFechaLimite = getMinFechaLimite();
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    // Pre-select the project when only one is available
    projectId: projects.length === 1 ? projects[0].projectId : "",
    // Default deadline: today at 5:00 PM
    fechaLimite: getDefaultFechaLimite(),
  }));
  const [estimatedHoursError, setEstimatedHoursError] = useState<string | null>(null);
  const [deadlineError, setDeadlineError] = useState<string | null>(null);

  const clearFeedback = () => {
    if (estimatedHoursError) {
      setEstimatedHoursError(null);
    }

    if (deadlineError) {
      setDeadlineError(null);
    }

    onClearSubmitError?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFeedback();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.projectId ||
      !form.titulo.trim() ||
      !form.fechaLimite ||
      !form.prioridadId
    )
      return;

    const selectedDateValue = form.fechaLimite.slice(0, 10);
    if (selectedDateValue < getTodayDateValue()) {
      setDeadlineError(DEADLINE_ERROR_MESSAGE);
      return;
    }

    const parsedTiempoEstimado =
      form.tiempoEstimado.trim() === "" ? null : Number(form.tiempoEstimado);

    if (
      parsedTiempoEstimado !== null &&
      (!Number.isFinite(parsedTiempoEstimado) ||
        parsedTiempoEstimado < 0 ||
        parsedTiempoEstimado > MAX_ESTIMATED_HOURS)
    ) {
      setEstimatedHoursError(ESTIMATED_HOURS_ERROR_MESSAGE);
      return;
    }

    setEstimatedHoursError(null);
  setDeadlineError(null);
    onClearSubmitError?.();

    onSubmit({
      projectId: form.projectId,
      titulo: form.titulo,
      descripcion: form.descripcion,
      fechaLimite: form.fechaLimite,
      prioridadId: parseInt(form.prioridadId, 10),
      tiempoEstimado: parsedTiempoEstimado,
    });
    setForm({
      ...EMPTY,
      projectId: projects.length === 1 ? projects[0].projectId : "",
      fechaLimite: getDefaultFechaLimite(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="modal-form"
      style={{ marginBottom: "24px" }}
    >
      {/* Project selector — shown whenever more than one project is available */}
      <FormControl size="small" required fullWidth>
        <InputLabel>Proyecto</InputLabel>
        <Select
          name="projectId"
          value={form.projectId}
          onChange={(e) => {
            clearFeedback();
            setForm({ ...form, projectId: e.target.value as string });
          }}
          label="Proyecto"
          disabled={projects.length === 1}
        >
          {projects.map((p) => (
            <MenuItem key={p.projectId} value={p.projectId}>
              {p.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        name="titulo"
        label="Título"
        value={form.titulo}
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
        rows={2}
        size="small"
        fullWidth
      />
      <TextField
        name="fechaLimite"
        label="Fecha Límite"
        type="datetime-local"
        value={form.fechaLimite}
        onChange={handleChange}
        required
        size="small"
        fullWidth
        error={Boolean(deadlineError)}
        helperText={deadlineError || " "}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
          htmlInput: {
            min: minFechaLimite,
          },
        }}
      />
      <div className="modal-form-row">
        <TextField
          name="tiempoEstimado"
          label="Tiempo Estimado (hrs)"
          type="number"
          value={form.tiempoEstimado}
          onChange={handleChange}
          size="small"
          error={Boolean(estimatedHoursError)}
          helperText={estimatedHoursError || " "}
          slotProps={{
            htmlInput: {
              min: 0,
              max: MAX_ESTIMATED_HOURS,
              step: 0.5,
            },
          }}
        />
        <FormControl size="small" required>
          <InputLabel>Prioridad</InputLabel>
          <Select
            name="prioridadId"
            value={form.prioridadId}
            onChange={(e) => {
              clearFeedback();
              setForm({ ...form, prioridadId: e.target.value as string });
            }}
            label="Prioridad"
          >
            {prioridades.map((p) => (
              <MenuItem key={p.prioridadId} value={p.prioridadId}>
                {p.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {(estimatedHoursError || submitError) && (
        <p
          className="task-form-feedback task-form-feedback--error"
          role="alert"
          data-testid="create-task-error"
        >
          {estimatedHoursError || submitError}
        </p>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={isPending}
        className="AddButton"
        fullWidth
      >
        {isPending ? <CircularProgress size={20} /> : "Agregar Tarea"}
      </Button>
    </form>
  );
};
