import React, { useState } from "react";
import { CircularProgress, Button, FormControl, Select, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  useTareas,
  useCreateTarea,
  useUpdateTareaStatus,
  useDeleteTarea,
} from "@/features/tareas/hooks/useTareas";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import { useProyectos } from "@/features/proyectos/hooks/useProyectos";
import { CreateTareaForm } from "@/features/tareas/components/CreateTareaForm";
import { TareaList } from "@/features/tareas/components/TareaList";
import { NavBar } from "@/shared/pages/NavBar";
import { AppModal } from "@/shared/components/AppModal";
import type { Tarea } from "@/features/tareas/types/tarea";

const PRIORIDADES = [
  { prioridadId: 1, nombre: "Alta" },
  { prioridadId: 2, nombre: "Media" },
  { prioridadId: 3, nombre: "Baja" },
];

export const TareasPage = () => {
  const [selectedTeamId,    setSelectedTeamId]    = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [modalOpen,         setModalOpen]          = useState(false);

  const { data: equipos }   = useEquipos();
  const { data: proyectos, isLoading: lp } = useProyectos(selectedTeamId || undefined);
  const { data: tareas,    isLoading: lt } = useTareas(selectedProjectId || undefined);

  const createMutation      = useCreateTarea(selectedProjectId);
  const statusMutation      = useUpdateTareaStatus(selectedProjectId);
  const deleteMutation      = useDeleteTarea(selectedProjectId);

  // Reset project when team changes
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedProjectId("");
  };

  const handleCreate = (data: {
    titulo: string;
    descripcion: string;
    fechaLimite: string;
    prioridadId: number;
    tiempoEstimado: number | null;
  }) => {
    const payload = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      fechaLimite: data.fechaLimite,
      prioridadId: data.prioridadId,
      ...(data.tiempoEstimado !== null && { tiempoEstimado: data.tiempoEstimado }),
    };
    createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
  };

  const handleDelete = (taskId: string) => deleteMutation.mutate(taskId);

  const handleStatusChange = (tarea: Tarea, newEstadoId: number) =>
    statusMutation.mutate({ taskId: tarea.taskId, estadoId: newEstadoId });

  return (
    <div className="App">
      <NavBar />

      <div className="page-header">
        <div>
          <h2>Tareas</h2>
          <p className="page-subtitle">Gestión de tareas por estado</p>
        </div>
        <Button
          className="AddButton"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          disabled={!selectedProjectId}
        >
          Nueva tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="section-label" style={{ margin: 0 }}>Equipo</span>
        <FormControl size="small" style={{ minWidth: 180 }}>
          <Select
            value={selectedTeamId}
            displayEmpty
            onChange={(e) => handleTeamChange(e.target.value as string)}
          >
            <MenuItem value="">
              <em style={{ fontStyle: "normal", color: "#A1A1AA" }}>Seleccionar</em>
            </MenuItem>
            {(equipos || []).map((eq) => (
              <MenuItem key={eq.teamId} value={eq.teamId}>{eq.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <span className="section-label" style={{ margin: 0 }}>Proyecto</span>
        <FormControl size="small" style={{ minWidth: 180 }}>
          <Select
            value={selectedProjectId}
            displayEmpty
            disabled={!selectedTeamId}
            onChange={(e) => setSelectedProjectId(e.target.value as string)}
          >
            <MenuItem value="">
              <em style={{ fontStyle: "normal", color: "#A1A1AA" }}>Seleccionar</em>
            </MenuItem>
            {(proyectos || []).map((p) => (
              <MenuItem key={p.projectId} value={p.projectId}>{p.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedProjectId && (
          <span className="filter-count">
            {(tareas || []).length} tarea{(tareas || []).length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Kanban */}
      {(lt || lp) ? (
        <CircularProgress style={{ marginTop: 40 }} />
      ) : !selectedProjectId ? (
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem", marginTop: 24 }}>
          Selecciona un equipo y proyecto para ver las tareas.
        </p>
      ) : (
        <TareaList
          tareas={tareas || []}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Create modal */}
      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva tarea">
        <CreateTareaForm
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          prioridades={PRIORIDADES}
        />
      </AppModal>
    </div>
  );
};
