import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/app/router/routes";
import { useEquipos, useCreateEquipo } from "@/features/equipos/hooks/useEquipos";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useAllProyectos } from "@/features/proyectos/hooks/useProyectos";
import { NavBar } from "@/shared/pages/NavBar";
import { EquiposPageHeader } from "@/features/equipos/components/EquiposPageHeader";
import { EquiposOverview } from "@/features/equipos/components/EquiposOverview";
import { EquiposTable } from "@/features/equipos/components/EquiposTable";
import {
  EquipoCreateModal,
  type EquipoCreateFormState,
} from "@/features/equipos/components/EquipoCreateModal";
import type { CreateEquipoRequest } from "@/features/equipos/types/equipo";
import type { TeamMember } from "@/features/equipos/services/equipoMemberService";
import styles from "./EquiposPage.module.css";

const EMPTY_FORM: EquipoCreateFormState = {
  nombre: "",
  descripcion: "",
  ownerId: "",
};

const PROJECT_FILTER_KEY = "proyectos.selectedTeamId";

const getRoleLabel = (rolId: number) => (rolId === 1 ? "MANAGER" : "DEVELOPER");

export const EquiposPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const canManageTeams = auth.user?.role === "MANAGER";

  const { data: equipos = [], isLoading: equiposLoading } = useEquipos();
  const { data: users = [] } = useUsers();
  const createMutation = useCreateEquipo();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<EquipoCreateFormState>(EMPTY_FORM);

  const teamIds = useMemo(() => equipos.map((equipo) => equipo.teamId), [equipos]);
  const { data: proyectos = [], isLoading: proyectosLoading } = useAllProyectos(teamIds);

  const projectCountsByTeamId = useMemo<Record<string, number>>(() => {
    return proyectos.reduce<Record<string, number>>((accumulator, proyecto) => {
      accumulator[proyecto.teamId] = (accumulator[proyecto.teamId] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [proyectos]);

  const totalMembers = useMemo(
    () => equipos.reduce((sum, equipo) => sum + (equipo.totalMembers ?? 0), 0),
    [equipos]
  );

  const totalProjects = proyectos.length;
  const isCreateDisabled = createMutation.isPending || users.length === 0;

  useEffect(() => {
    if (!form.ownerId && users.length > 0) {
      setForm((current) => ({
        ...current,
        ownerId: users[0].userId,
      }));
    }
  }, [users, form.ownerId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleOwnerChange = (ownerId: string) => {
    setForm((current) => ({ ...current, ownerId }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.nombre.trim() || !form.ownerId) {
      return;
    }

    const payload: CreateEquipoRequest = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      ownerId: form.ownerId,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        setModalOpen(false);
      },
    });
  };

  const handleOpenCreate = () => {
    if (!canManageTeams || users.length === 0) {
      return;
    }

    setForm((current) => ({
      ...EMPTY_FORM,
      ownerId: current.ownerId || users[0].userId,
    }));
    setModalOpen(true);
  };

  const handleCloseCreate = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleOpenTeam = (teamId: string) => {
    navigate(`${ROUTES.equipos}/${teamId}`);
  };

  return (
    <div className="App">
      <NavBar />

      <div className={styles.page}>
      <EquiposPageHeader onCreateEquipo={handleOpenCreate} disableCreate={!canManageTeams || isCreateDisabled} />

        <EquiposOverview
          totalTeams={equipos.length}
          totalMembers={totalMembers}
          totalProjects={proyectosLoading ? 0 : totalProjects}
        />

        <EquiposTable
          equipos={equipos}
          isLoading={equiposLoading || proyectosLoading}
          projectCountsByTeamId={projectCountsByTeamId}
          onOpenTeam={handleOpenTeam}
        />
      </div>

      <EquipoCreateModal
        open={modalOpen}
        users={users}
        form={form}
        onClose={handleCloseCreate}
        onChange={handleChange}
        onOwnerChange={handleOwnerChange}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
      />
    </div>
  );
};
