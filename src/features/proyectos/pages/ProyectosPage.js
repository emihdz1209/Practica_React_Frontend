import React, { useState } from 'react';
import { TextField, Button, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useProyectos, useCreateProyecto } from '../hooks/useProyectos';
import { useEquipos } from '../../equipos/hooks/useEquipos';
import NavBar from '../../../shared/pages/NavBar';
import AppModal from '../../../shared/components/AppModal';

const EMPTY = { nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', teamId: '' };

export default function ProyectosPage() {
  const { data: proyectos, isLoading } = useProyectos();
  const { data: equipos } = useEquipos();
  const createMutation = useCreateProyecto();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.teamId) return;
    createMutation.mutate(
      { ...form, fechaInicio: form.fechaInicio || null, fechaFin: form.fechaFin || null },
      { onSuccess: () => { setForm(EMPTY); setModalOpen(false); } }
    );
  };

  const getEquipoNombre = (teamId) => {
    const eq = (equipos || []).find((e) => e.teamId === teamId);
    return eq ? eq.nombre : '—';
  };

  const fmtDate = (str) => str ? new Date(str).toLocaleDateString('es-MX') : '—';

  const progressColor = (pct) =>
    pct >= 75 ? '#16A34A' : pct >= 40 ? '#2563EB' : '#D97706';

  return (
    <div className="App">
      <NavBar />
      <div className="page-header">
        <div>
          <h2>Proyectos</h2>
          <p className="page-subtitle">Gestión de proyectos y progreso</p>
        </div>
        <Button className="AddButton" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Nuevo proyecto
        </Button>
      </div>

      <div style={{ width: '100%' }}>
        <span className="section-label">Proyectos registrados · {(proyectos||[]).length}</span>
        {isLoading ? <CircularProgress /> : (
          <table>
            <thead>
              <tr><th>Nombre</th><th>Descripción</th><th>Equipo</th><th>Progreso</th><th>Inicio</th><th>Fin</th></tr>
            </thead>
            <tbody>
              {(proyectos || []).map((p) => {
                const pct = p.progreso || 0;
                return (
                  <tr key={p.projectId}>
                    <td className="cell-primary">{p.nombre}</td>
                    <td>{p.descripcion || '—'}</td>
                    <td>{getEquipoNombre(p.teamId)}</td>
                    <td>
                      <div className="progress-wrap">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${pct}%`, background: progressColor(pct) }}
                          />
                        </div>
                        <span className="progress-label">{pct}%</span>
                      </div>
                    </td>
                    <td>{fmtDate(p.fechaInicio)}</td>
                    <td>{fmtDate(p.fechaFin)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo proyecto">
        <form onSubmit={handleSubmit} className="modal-form">
          <TextField name="nombre"      label="Nombre del proyecto" value={form.nombre}      onChange={handleChange} required size="small" fullWidth />
          <TextField name="descripcion" label="Descripción"         value={form.descripcion} onChange={handleChange} multiline rows={2} size="small" fullWidth />
          <div className="modal-form-row">
            <TextField name="fechaInicio" label="Fecha inicio" type="datetime-local" value={form.fechaInicio} onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
            <TextField name="fechaFin"    label="Fecha fin"    type="datetime-local" value={form.fechaFin}    onChange={handleChange} size="small" InputLabelProps={{ shrink: true }} />
          </div>
          <FormControl size="small" required fullWidth>
            <InputLabel>Equipo</InputLabel>
            <Select name="teamId" value={form.teamId} onChange={handleChange} label="Equipo">
              {(equipos || []).map((eq) => (
                <MenuItem key={eq.teamId} value={eq.teamId}>{eq.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" className="AddButton" disabled={createMutation.isLoading} fullWidth>
            {createMutation.isLoading ? <CircularProgress size={18} /> : 'Crear proyecto'}
          </Button>
        </form>
      </AppModal>
    </div>
  );
}
