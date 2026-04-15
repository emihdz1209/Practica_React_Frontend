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
import type { Proyecto } from "@/features/proyectos/types/proyecto";

interface Prioridad {
  prioridadId: number;
  nombre: string;
}

interface Props {
  onSubmit: (data: {
    titulo: string;
    descripcion: string;
    fechaLimite: string;
    prioridadId: number;
    tiempoEstimado: number | null;
  }) => void;
  isPending: boolean;
  proyectos?: Proyecto[];
  prioridades: Prioridad[];
}

const EMPTY = {
  titulo: "",
  descripcion: "",
  fechaLimite: "",
  tiempoEstimado: "",
  prioridadId: "",
};

export const CreateTareaForm = ({ onSubmit, isPending, prioridades }: Props) => {
  const [form, setForm] = useState(EMPTY);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fechaLimite || !form.prioridadId) return;
    onSubmit({
      titulo: form.titulo,
      descripcion: form.descripcion,
      fechaLimite: form.fechaLimite,
      prioridadId: parseInt(form.prioridadId),
      tiempoEstimado: form.tiempoEstimado ? parseFloat(form.tiempoEstimado) : null,
    });
    setForm(EMPTY);
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form" style={{ marginBottom: "24px" }}>
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
        InputLabelProps={{ shrink: true }}
        fullWidth
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
            onChange={(e) => setForm({ ...form, prioridadId: e.target.value as string })}
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
