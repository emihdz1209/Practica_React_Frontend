import { useEffect, useState } from "react";
import {
  CircularProgress,
  Button,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useManagedProjects } from "@/features/dashboard/hooks/dashboard";
import {
  useMultiProjectTareas,
  useCreateTarea,
  useUpdateTareaStatus,
  useDeleteTarea,
} from "@/features/tareas/hooks/useTareas";
import type { CreateTareaRequest, Tarea } from "@/features/tareas/types/tarea";
import { CreateTareaForm } from "@/features/tareas/components/CreateTareaForm";
import { TareaList } from "@/features/tareas/components/TareaList";
import { TareasModal } from "@/features/tareas/components/TareasModal";
import { NavBar } from "@/shared/pages/NavBar";
import { AppModal } from "@/shared/components/AppModal";

const PRIORIDADES = [
  { prioridadId: 1, nombre: "Alta" },
  { prioridadId: 2, nombre: "Media" },
  { prioridadId: 3, nombre: "Baja" },
];


export const TareasPage = () => {
  const { auth } = useAuth();
  const userId = auth.user?.userId;

  const { data: allProjects = [], isLoading: loadingProjects } = useManagedProjects(userId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Select all projects as soon as they load
  useEffect(() => {
    if (!initialized && allProjects.length > 0) {
      setSelectedIds(allProjects.map((p) => p.projectId));
      setInitialized(true);
    }
  }, [allProjects, initialized]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedIds(typeof value === "string" ? value.split(",") : value);
    setSelectedTaskId(null);
  };

  const selectAll = () => {
    setSelectedIds(allProjects.map((p) => p.projectId));
    setSelectedTaskId(null);
  };

  const unselectAll = () => {
    setSelectedIds([]);
    setSelectedTaskId(null);
  };

  const nameMap: Record<string, string> = {};
  allProjects.forEach((p) => (nameMap[p.projectId] = p.nombre));

  // Fetch tasks for all selected projects in parallel
  const { data: allTareas, isLoading: loadingTareas } = useMultiProjectTareas(selectedIds);

  // Projects currently visible in the filter — used to populate the create form
  const selectedProjects = allProjects.filter((p) => selectedIds.includes(p.projectId));

  const createMutation = useCreateTarea();
  // Pass undefined so mutations rely on global ["tareas"] invalidation
  const statusMutation = useUpdateTareaStatus(undefined);
  const deleteMutation = useDeleteTarea(undefined);

  const handleCreate = (data: {
    projectId: string;
    titulo: string;
    descripcion: string;
    fechaLimite: string;
    prioridadId: number;
    tiempoEstimado: number | null;
  }) => {
    const payload: CreateTareaRequest = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      fechaLimite: data.fechaLimite,
      prioridadId: data.prioridadId,
      ...(data.tiempoEstimado !== null && { tiempoEstimado: data.tiempoEstimado }),
    };
    createMutation.mutate(
      { projectId: data.projectId, data: payload },
      { onSuccess: () => setCreateModalOpen(false) }
    );
  };

  const handleDelete = (taskId: string) => deleteMutation.mutate(taskId);

  const handleOpenTaskDetails = (taskId: string) => setSelectedTaskId(taskId);

  const handleCloseTaskDetails = () => setSelectedTaskId(null);

  const handleStatusChange = (tarea: Tarea, newEstadoId: number) =>
    statusMutation.mutate({ taskId: tarea.taskId, estadoId: newEstadoId });

  // Derive the projectId from the selected task so the modal can use it
  const selectedTaskProjectId =
    selectedTaskId != null
      ? allTareas.find((t) => t.taskId === selectedTaskId)?.projectId
      : undefined;

  const isSideModalOpen = Boolean(selectedTaskId);
  const allSelected = selectedIds.length === allProjects.length && allProjects.length > 0;

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
          onClick={() => setCreateModalOpen(true)}
          disabled={selectedIds.length === 0}
        >
          Nueva tarea
        </Button>
      </div>

      <div className={`tareas-layout ${isSideModalOpen ? "tareas-layout--with-panel" : ""}`}>
        <div className="tareas-main">
          <div className="tareas-board-container">
            {/* Filters */}
            <div className="filter-bar">
              <span className="section-label" style={{ margin: 0 }}>Proyectos</span>

              {loadingProjects ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  <FormControl size="small" style={{ minWidth: 280, maxWidth: 480 }}>
                    <Select
                      multiple
                      value={selectedIds}
                      onChange={handleChange}
                      renderValue={(sel) =>
                        sel.length === 0
                          ? "Ninguno seleccionado"
                          : sel.length === allProjects.length
                          ? "Todos los proyectos"
                          : sel.map((id) => nameMap[id] ?? id).join(", ")
                      }
                      displayEmpty
                    >
                      {allProjects.map((p) => (
                        <MenuItem key={p.projectId} value={p.projectId}>
                          <Checkbox checked={selectedIds.includes(p.projectId)} size="small" />
                          <ListItemText primary={p.nombre} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={allSelected ? unselectAll : selectAll}
                    style={{ textTransform: "none", fontSize: "0.75rem" }}
                    disabled={allProjects.length === 0}
                  >
                    {allSelected ? "Desel. todo" : "Sel. todo"}
                  </Button>
                </>
              )}

              {selectedIds.length > 0 && (
                <span className="filter-count">
                  {allTareas.length} tarea{allTareas.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Kanban */}
            {loadingTareas ? (
              <CircularProgress style={{ marginTop: 40 }} />
            ) : selectedIds.length === 0 ? (
              <p style={{ color: "var(--text-3)", fontSize: "0.875rem", marginTop: 24 }}>
                Selecciona al menos un proyecto para ver las tareas.
              </p>
            ) : (
              <TareaList
                tareas={allTareas}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onOpenDetails={handleOpenTaskDetails}
              />
            )}
          </div>
        </div>

        <TareasModal
          taskId={selectedTaskId}
          projectId={selectedTaskProjectId}
          onClose={handleCloseTaskDetails}
        />
      </div>

      {/* Create modal */}
      <AppModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nueva tarea">
        <CreateTareaForm
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          projects={selectedProjects}
          prioridades={PRIORIDADES}
        />
      </AppModal>
    </div>
  );
};
