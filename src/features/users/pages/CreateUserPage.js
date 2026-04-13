import React, { useState } from 'react';
import { TextField, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCreateUser, useUsers } from '../hooks/useUsers';
import NavBar from '../../../shared/pages/NavBar';
import AppModal from '../../../shared/components/AppModal';

const EMPTY = { primerNombre: '', apellido: '', telefono: '', email: '', telegramId: '' };

export default function CreateUserPage() {
  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.primerNombre.trim() || !form.email.trim() || !form.telegramId.trim()) return;
    createMutation.mutate(form, { onSuccess: () => { setForm(EMPTY); setModalOpen(false); } });
  };

  return (
    <div className="App">
      <NavBar />
      <div className="page-header">
        <div>
          <h2>Usuarios</h2>
          <p className="page-subtitle">Gestión de usuarios del sistema</p>
        </div>
        <Button className="AddButton" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Nuevo usuario
        </Button>
      </div>

      <div style={{ width: '100%' }}>
        <span className="section-label">Usuarios registrados · {(users||[]).length}</span>
        {isLoading ? <CircularProgress /> : (
          <table>
            <thead><tr><th>Nombre</th><th>Apellido</th><th>Email</th><th>Telegram</th></tr></thead>
            <tbody>
              {(users || []).map((u) => (
                <tr key={u.userId}>
                  <td className="cell-primary">{u.primerNombre}</td>
                  <td>{u.apellido}</td>
                  <td>{u.email}</td>
                  <td className="cell-accent">{u.telegramId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo usuario">
        <form onSubmit={handleSubmit} className="modal-form">
          <TextField name="primerNombre" label="Nombre"      value={form.primerNombre} onChange={handleChange} required size="small" fullWidth />
          <TextField name="apellido"     label="Apellido"    value={form.apellido}     onChange={handleChange} required size="small" fullWidth />
          <TextField name="telefono"     label="Teléfono"    value={form.telefono}     onChange={handleChange} size="small"           fullWidth />
          <TextField name="email"        label="Email"       value={form.email}        onChange={handleChange} required size="small" fullWidth type="email" />
          <TextField name="telegramId"   label="Telegram ID" value={form.telegramId}   onChange={handleChange} required size="small" fullWidth />
          <Button type="submit" variant="contained" className="AddButton" disabled={createMutation.isLoading} fullWidth>
            {createMutation.isLoading ? <CircularProgress size={18} /> : 'Crear usuario'}
          </Button>
        </form>
      </AppModal>
    </div>
  );
}
