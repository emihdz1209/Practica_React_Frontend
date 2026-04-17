/// src/features/proyectos/pages/ProyectosPage.tsx

import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import {
  useProyectos,
  useCreateProyecto,
} from "@/features/proyectos/hooks/useProyectos";
import type { Proyecto } from "@/features/proyectos/types/proyecto";
import {
  CreateProyectoModal,
  type ProyectoCreateFormState,
} from "@/features/proyectos/components/CreateProyectoModal";
import { ProyectosFilters } from "@/features/proyectos/components/ProyectosFilters";
import { ProyectosTable } from "@/features/proyectos/components/ProyectosTable";
import { ProyectoSideModal } from "@/features/proyectos/components/ProyectoSideModal";
import { NavBar } from "@/shared/pages/NavBar";
import { ProjectDashboard } from "@/features/proyectos/components/ProjectDashboard";

// ── Persistence helpers ──────────────────────────────────────────────────────

const TEAM_STORAGE_KEY = "proyectos.selectedTeamId";
const PROJECT_STORAGE_KEY = "proyectos.selectedProjectId";

const readStoredValue = (key: string): string => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

const persistStoredValue = (key: string, value: string): void => {
  try {
    if (value) {
      localStorage.setItem(key, value);
      return;
    }
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors to keep filtering functional.
  }
};

const EMPTY: ProyectoCreateFormState = {
  nombre: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
};

// ── ProyectosPage ─────────────────────────────────────────────────────────────

export const ProyectosPage = () => {
  const { data: equipos, isLoading: loadingEquipos } = useEquipos();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    () => readStoredValue(TEAM_STORAGE_KEY)
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => readStoredValue(PROJECT_STORAGE_KEY)
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Proyecto | null>(null);
  const [form, setForm] = useState(EMPTY);

  const { data: proyectos, isLoading: loadingProyectos } = useProyectos(
    selectedTeamId || undefined
  );
  const createMutation = useCreateProyecto(selectedTeamId);

  const isSideModalOpen = Boolean(detailProject);

  // ── Persistence effects ────────────────────────────────────────
  useEffect(() => {
    persistStoredValue(TEAM_STORAGE_KEY, selectedTeamId);
  }, [selectedTeamId]);

  useEffect(() => {
    persistStoredValue(PROJECT_STORAGE_KEY, selectedProjectId);
  }, [selectedProjectId]);

  // Validate stored team still exists
  useEffect(() => {
    if (!equipos || !selectedTeamId) return;
    const teamExists = equipos.some((eq) => eq.teamId === selectedTeamId);
    if (!teamExists) {
      setSelectedTeamId("");
      setSelectedProjectId("");
    }
  }, [equipos, selectedTeamId]);

  // Validate stored project still belongs to selected team
  useEffect(() => {
    if (!selectedProjectId) return;
    if (!selectedTeamId) {
      setSelectedProjectId("");
      return;
    }
    if (!proyectos) return;
    const projectExists = proyectos.some((p) => p.projectId === selectedProjectId);
    if (!projectExists) setSelectedProjectId("");
  }, [selectedProjectId, selectedTeamId, proyectos]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedProjectId("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !selectedTeamId) return;
    createMutation.mutate(
      {
        ...form,
        fechaInicio: form.fechaInicio || null,
        fechaFin: form.fechaFin || null,
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          setCreateModalOpen(false);
        },
      }
    );
  };

  const selectedProject = proyectos?.find((p) => p.projectId === selectedProjectId);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="App">
      <NavBar />

      <div className="page-header">
        <div>
          <h2>Proyectos</h2>
          <p className="page-subtitle">Gestión de proyectos y dashboard de KPIs</p>
        </div>
        <Button
          className="AddButton"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
          disabled={!selectedTeamId}
        >
          Nuevo proyecto
        </Button>
      </div>

      {/* Main layout with side modal */}
      <div className={`tareas-layout ${isSideModalOpen ? "tareas-layout--with-panel" : ""}`}>
        <div className="tareas-main">
          <ProyectosFilters
            selectedTeamId={selectedTeamId}
            selectedProjectId={selectedProjectId}
            equipos={equipos}
            proyectos={proyectos}
            onTeamChange={handleTeamChange}
            onProjectChange={setSelectedProjectId}
          />

          <ProyectosTable
            isLoading={loadingEquipos || loadingProyectos}
            selectedTeamId={selectedTeamId}
            selectedProjectId={selectedProjectId}
            detailProjectId={detailProject?.projectId || null}
            proyectos={proyectos}
            onDetailProjectChange={setDetailProject}
            onDashboardProjectChange={(projectId) => {
              setSelectedProjectId(projectId === selectedProjectId ? "" : projectId);
            }}
          />

          {/* Dashboard section */}
          {selectedProjectId && selectedProject && (
            <div style={{ width: "100%" }}>
              <div className="divider" />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span className="section-label" style={{ margin: 0 }}>
                  Dashboard
                </span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-2)",
                  }}
                >
                  {selectedProject.nombre}
                </span>
              </div>
              <ProjectDashboard projectId={selectedProjectId} />
            </div>
          )}
        </div>

        {/* Side modal */}
        <ProyectoSideModal
          project={detailProject}
          teamId={selectedTeamId}
          onClose={() => setDetailProject(null)}
          onProjectDeleted={(deletedId) => {
            if (deletedId === selectedProjectId) {
              setSelectedProjectId("");
            }
            setDetailProject(null);
          }}
        />
      </div>

      {/* Create project modal */}
      <CreateProyectoModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
      />
    </div>
  );
};