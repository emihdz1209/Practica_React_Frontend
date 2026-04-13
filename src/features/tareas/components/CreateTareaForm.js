import React, { useState } from 'react';
import {
  TextField, Button, MenuItem, Select, InputLabel, FormControl,
  CircularProgress
} from '@mui/material';

export default function CreateTareaForm({ onSubmit, isPending, proyectos, prioridades, estados }) {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    fechaLimite: '',
    tiempoEstimado: '',
    tiempoReal: '',
    estadoId: '',
    prioridadId: '',
    proyectId: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fechaLimite || !form.estadoId || !form.prioridadId || !form.proyectId) return;
    onSubmit({
      titulo: form.titulo,
      descripcion: form.descripcion,
      fechaLimite: form.fechaLimite,
      tiempoEstimado: form.tiempoEstimado ? parseFloat(form.tiempoEstimado) : null,
      tiempoReal: form.tiempoReal ? parseFloat(form.tiempoReal) : null,
      estadoId: parseInt(form.estadoId),
      prioridadId: parseInt(form.prioridadId),
      proyectId: form.proyectId,
    });
    setForm({ titulo: '', descripcion: '', fechaLimite: '', tiempoEstimado: '', tiempoReal: '', estadoId: '', prioridadId: '', proyectId: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form" style={{ marginBottom: '24px' }}>
      <TextField name="titulo" label="Titulo" value={form.titulo} onChange={handleChange} required size="small" fullWidth />
      <TextField name="descripcion" label="Descripcion" value={form.descripcion} onChange={handleChange} multiline rows={2} size="small" fullWidth />
      <TextField name="fechaLimite" label="Fecha Limite" type="datetime-local" value={form.fechaLimite} onChange={handleChange} required size="small" InputLabelProps={{ shrink: true }} fullWidth />
      <div className="modal-form-row">
        <TextField name="tiempoEstimado" label="Tiempo Estimado (hrs)" type="number" value={form.tiempoEstimado} onChange={handleChange} size="small" />
        <TextField name="tiempoReal" label="Tiempo Real (hrs)" type="number" value={form.tiempoReal} onChange={handleChange} size="small" />
      </div>
      <FormControl size="small" required fullWidth>
        <InputLabel>Proyecto</InputLabel>
        <Select name="proyectId" value={form.proyectId} onChange={handleChange} label="Proyecto">
          {(proyectos || []).map((p) => (
            <MenuItem key={p.projectId} value={p.projectId}>{p.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="modal-form-row">
        <FormControl size="small" required>
          <InputLabel>Prioridad</InputLabel>
          <Select name="prioridadId" value={form.prioridadId} onChange={handleChange} label="Prioridad">
            {(prioridades || []).map((p) => (
              <MenuItem key={p.prioridadId} value={p.prioridadId}>{p.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" required>
          <InputLabel>Estado</InputLabel>
          <Select name="estadoId" value={form.estadoId} onChange={handleChange} label="Estado">
            {(estados || []).map((e) => (
              <MenuItem key={e.estadoId} value={e.estadoId}>{e.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <Button type="submit" variant="contained" disabled={isPending} className="AddButton" fullWidth>
        {isPending ? <CircularProgress size={20} /> : 'Agregar Tarea'}
      </Button>
    </form>
  );
}
