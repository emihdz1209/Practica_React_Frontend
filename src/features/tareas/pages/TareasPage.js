import React, { useState } from 'react';
import { CircularProgress, Button, FormControl, Select, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTareas, useCreateTarea, useUpdateTarea, useDeleteTarea } from '../hooks/useTareas';
import { useProyectos } from '../../proyectos/hooks/useProyectos';
import CreateTareaForm from '../components/CreateTareaForm';
import TareaList from '../components/TareaList';
import NavBar from '../../../shared/pages/NavBar';
import AppModal from '../../../shared/components/AppModal';

const PRIORIDADES = [
  { prioridadId: 1, nombre: 'Alta' },
  { prioridadId: 2, nombre: 'Media' },
  { prioridadId: 3, nombre: 'Baja' },
];
const ESTADOS = [
  { estadoId: 1, nombre: 'Pendiente' },
  { estadoId: 2, nombre: 'En_Proceso' },
  { estadoId: 3, nombre: 'Completada' },
  { estadoId: 4, nombre: 'Cancelada' },
];

export default function TareasPage() {
  const { data: tareas,    isLoading: lt } = useTareas();
  const { data: proyectos, isLoading: lp } = useProyectos();
  const createMutation = useCreateTarea();
  const updateMutation = useUpdateTarea();
  const deleteMutation = useDeleteTarea();

  const [modalOpen,      setModalOpen]      = useState(false);
  const [proyectoFiltro, setProyectoFiltro] = useState('');

  const handleCreate = (data) =>
    createMutation.mutate(data, { onSuccess: () => setModalOpen(false) });
  const handleDelete = (id) => deleteMutation.mutate(id);
  const handleStatusChange = (tarea, newEstadoId) =>
    updateMutation.mutate({ taskId: tarea.taskId, data: { ...tarea, estadoId: newEstadoId } });

  const tareasFiltradas = proyectoFiltro
    ? (tareas || []).filter((t) => t.proyectId === proyectoFiltro)
    : (tareas || []);

  return (
    <div className="App">
      <NavBar />

      <div className="page-header">
        <div>
          <h2>Tareas</h2>
          <p className="page-subtitle">Gestión de tareas por estado</p>
        </div>
        <Button className="AddButton" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          Nueva tarea
        </Button>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <span className="section-label" style={{ margin: 0 }}>Filtrar por proyecto</span>
        <FormControl size="small" style={{ minWidth: 200 }}>
          <Select
            value={proyectoFiltro}
            displayEmpty
            onChange={(e) => setProyectoFiltro(e.target.value)}
          >
            <MenuItem value=""><em style={{ fontStyle: 'normal', color: '#A1A1AA' }}>Todos</em></MenuItem>
            {(proyectos || []).map((p) => (
              <MenuItem key={p.projectId} value={p.projectId}>{p.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {proyectoFiltro && (
          <span className="filter-count">{tareasFiltradas.length} tarea{tareasFiltradas.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Kanban */}
      {(lt || lp) ? (
        <CircularProgress style={{ marginTop: 40 }} />
      ) : (
        <TareaList
          tareas={tareasFiltradas}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          proyectos={proyectos}
        />
      )}

      {/* Modal */}
      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva tarea">
        <CreateTareaForm
          onSubmit={handleCreate}
          isPending={createMutation.isLoading}
          proyectos={proyectos}
          prioridades={PRIORIDADES}
          estados={ESTADOS}
        />
      </AppModal>
    </div>
  );
}
