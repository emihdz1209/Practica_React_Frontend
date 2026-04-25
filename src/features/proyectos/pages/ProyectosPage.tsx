/// src/features/proyectos/pages/ProyectosPage.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import {
  useAllProyectos,
  useCreateProyecto,
} from "@/features/proyectos/hooks/useProyectos";
import { useMultiProjectTareas } from "@/features/tareas/hooks/useTareas";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  CreateProyectoModal,
  type ProyectoCreateFormState,
} from "@/features/proyectos/components/CreateProyectoModal";
import { ProyectosFilters } from "@/features/proyectos/components/ProyectosFilters";
import { ProyectosCardsGrid } from "@/features/proyectos/components/ProyectosCardsGrid";
import { ProyectosPageHeader } from "@/features/proyectos/components/ProyectosPageHeader";
import { NavBar } from "@/shared/pages/NavBar";
import { useAppModal } from "@/shared/components/AppModal";
import { ROUTES } from "@/app/router/routes";

// ── Persistence helpers ──────────────────────────────────────────────────────

const TEAM_STORAGE_KEY = "proyectos.selectedTeamId";

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

const getCurrentDateTimeLocalValue = (): string => {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offsetMinutes * 60_000);

  return localDate.toISOString().slice(0, 16);
};

// ── ProyectosPage ─────────────────────────────────────────────────────────────

export const ProyectosPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { data: equipos, isLoading: loadingEquipos } = useEquipos();
  const canManageProjects = auth.user?.role === "MANAGER";

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    () => readStoredValue(TEAM_STORAGE_KEY)
  );
  const [form, setForm] = useState(EMPTY);
  const createModal = useAppModal();

  const teamIds = useMemo(
    () => (equipos ?? []).map((equipo) => equipo.teamId),
    [equipos]
  );
  const teamNameById = useMemo<Record<string, string>>(
    () => Object.fromEntries((equipos ?? []).map((equipo) => [equipo.teamId, equipo.nombre])),
    [equipos]
  );
  const teamMembersById = useMemo<Record<string, number>>(
    () => Object.fromEntries((equipos ?? []).map((equipo) => [equipo.teamId, equipo.totalMembers])),
    [equipos]
  );

  const { data: allProjects = [], isLoading: loadingProyectos } = useAllProyectos(teamIds);
  const proyectos = useMemo(
    () =>
      selectedTeamId
        ? allProjects.filter((project) => project.teamId === selectedTeamId)
        : allProjects,
    [allProjects, selectedTeamId]
  );
  const projectIds = useMemo(() => proyectos.map((project) => project.projectId), [proyectos]);
  const { data: projectTasks = [], isLoading: loadingProjectTasks } = useMultiProjectTareas(projectIds);

  const taskStatsByProjectId = useMemo<Record<string, { completed: number; total: number }>>(() => {
    const stats: Record<string, { completed: number; total: number }> = {};

    projectIds.forEach((projectId) => {
      stats[projectId] = { completed: 0, total: 0 };
    });

    projectTasks.forEach((task) => {
      if (!stats[task.projectId]) {
        stats[task.projectId] = { completed: 0, total: 0 };
      }

      stats[task.projectId].total += 1;
      if (task.fechaFinalizacion) {
        stats[task.projectId].completed += 1;
      }
    });

    return stats;
  }, [projectIds, projectTasks]);

  const createMutation = useCreateProyecto(selectedTeamId);

  // ── Persistence effects ────────────────────────────────────────
  useEffect(() => {
    persistStoredValue(TEAM_STORAGE_KEY, selectedTeamId);
  }, [selectedTeamId]);

  // Validate stored team still exists
  useEffect(() => {
    if (!equipos || !selectedTeamId) return;
    const teamExists = equipos.some((eq) => eq.teamId === selectedTeamId);
    if (!teamExists) {
      setSelectedTeamId("");
    }
  }, [equipos, selectedTeamId]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageProjects || !form.nombre.trim() || !selectedTeamId) return;
    createMutation.mutate(
      {
        ...form,
        fechaInicio: form.fechaInicio || null,
        fechaFin: form.fechaFin || null,
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          createModal.closeModal();
        },
      }
    );
  };

  const handleOpenCreateModal = () => {
    if (!canManageProjects) {
      return;
    }

    if (!selectedTeamId && teamIds.length > 0) {
      setSelectedTeamId(teamIds[0]);
    }

    setForm({
      ...EMPTY,
      fechaInicio: getCurrentDateTimeLocalValue(),
    });

    createModal.openModal();
  };

  const handleCloseCreateModal = () => {
    createModal.closeModal();
    setForm(EMPTY);
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`${ROUTES.proyectos}/${projectId}`);
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="App">
      <NavBar />

      <ProyectosPageHeader
        onCreateProject={handleOpenCreateModal}
        isCreateDisabled={!canManageProjects || loadingEquipos || teamIds.length === 0}
      />

      <ProyectosFilters
        selectedTeamId={selectedTeamId}
        equipos={equipos}
        showProjectFilter={false}
        onTeamChange={handleTeamChange}
      />

      <ProyectosCardsGrid
        isLoading={loadingEquipos || loadingProyectos}
        isTaskStatsLoading={loadingProjectTasks}
        selectedTeamId={selectedTeamId}
        proyectos={proyectos}
        teamNameById={teamNameById}
        teamMembersById={teamMembersById}
        taskStatsByProjectId={taskStatsByProjectId}
        onOpenProject={handleOpenProject}
      />

      {/* Create project modal */}
      <CreateProyectoModal
        open={canManageProjects && createModal.isOpen}
        onClose={handleCloseCreateModal}
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
      />
    </div>
  );
};