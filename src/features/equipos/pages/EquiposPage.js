import React, { useState } from 'react';
import { TextField, Button, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEquipos, useCreateEquipo } from '../hooks/useEquipos';
import { useUsers } from '../../users/hooks/useUsers';
import NavBar from '../../../shared/pages/NavBar';
import AppModal from '../../../shared/components/AppModal';

const EMPTY = { nombre: '', descripcion: '', userId: '' };

export default function EquiposPage() {
  const { data: equipos, isLoading } = useEquipos();
  const { data: users } = useUsers();
  const createMutation = useCreateEquipo();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.userId) return;
    createMutation.mutate(form, { onSuccess: () => { setForm(EMPTY); setModalOpen(false); } });
  };

  const getUserNombre = (userId) => {
    const u = (users || []).find((us) => us.userId === userId);
    return u ? `${u.primerNombre} ${u.apellido}` : '—';
  };

  return (
    <div className="App">
      <NavBar />
      <div className="page-header">
        <div>
          <h2>Equipos</h2>
          <p className="page-subtitle">Gestión de equipos de trabajo</p>
        </div>
        <Button className="AddButton" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Nuevo equipo
        </Button>
      </div>

      <div style={{ width: '100%' }}>
        <span className="section-label">Equipos registrados · {(equipos||[]).length}</span>
        {isLoading ? <CircularProgress /> : (
          <table>
            <thead><tr><th>Nombre</th><th>Descripción</th><th>Owner</th></tr></thead>
            <tbody>
              {(equipos || []).map((eq) => (
                <tr key={eq.teamId}>
                  <td className="cell-primary">{eq.nombre}</td>
                  <td>{eq.descripcion || '—'}</td>
                  <td>{getUserNombre(eq.userId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo equipo">
        <form onSubmit={handleSubmit} className="modal-form">
          <TextField name="nombre"      label="Nombre del equipo" value={form.nombre}      onChange={handleChange} required size="small" fullWidth />
          <TextField name="descripcion" label="Descripción"       value={form.descripcion} onChange={handleChange} multiline rows={2} size="small" fullWidth />
          <FormControl size="small" required fullWidth>
            <InputLabel>Owner</InputLabel>
            <Select name="userId" value={form.userId} onChange={handleChange} label="Owner">
              {(users || []).map((u) => (
                <MenuItem key={u.userId} value={u.userId}>{u.primerNombre} {u.apellido}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" className="AddButton" disabled={createMutation.isLoading} fullWidth>
            {createMutation.isLoading ? <CircularProgress size={18} /> : 'Crear equipo'}
          </Button>
        </form>
      </AppModal>
    </div>
  );
}
