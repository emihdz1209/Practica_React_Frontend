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
}

const getDefaultFechaLimite = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T17:00`;
};

const EMPTY = {
  projectId: "",
  titulo: "",
  descripcion: "",
  fechaLimite: "",
  tiempoEstimado: "",
  prioridadId: "",
};

export const CreateTareaForm = ({
  onSubmit,
  isPending,
  projects,
  prioridades,
}: Props) => {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    // Pre-select the project when only one is available
    projectId: projects.length === 1 ? projects[0].projectId : "",
    // Default deadline: today at 5:00 PM
    fechaLimite: getDefaultFechaLimite(),
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    onSubmit({
      projectId: form.projectId,
      titulo: form.titulo,
      descripcion: form.descripcion,
      fechaLimite: form.fechaLimite,
      prioridadId: parseInt(form.prioridadId),
      tiempoEstimado: form.tiempoEstimado
        ? parseFloat(form.tiempoEstimado)
        : null,
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
          onChange={(e) =>
            setForm({ ...form, projectId: e.target.value as string })
          }
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
        slotProps={{
          inputLabel: {
            shrink: true,
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
        />
        <FormControl size="small" required>
          <InputLabel>Prioridad</InputLabel>
          <Select
            name="prioridadId"
            value={form.prioridadId}
            onChange={(e) =>
              setForm({ ...form, prioridadId: e.target.value as string })
            }
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
