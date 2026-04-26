import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { NavBar } from "@/shared/pages/NavBar";
import { ROUTES } from "@/app/router/routes";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import { useEquipoMembers, useAddMember, useRemoveMember } from "@/features/equipos/hooks/useEquipoMembers";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useProyectos } from "@/features/proyectos/hooks/useProyectos";
import type { TeamMember } from "@/features/equipos/services/equipoMemberService";
import { EquipoDetailHeader } from "@/features/equipos/components/EquipoDetailHeader";
import { EquipoDescriptionCard } from "@/features/equipos/components/EquipoDescriptionCard";
import { EquipoMembersCard } from "@/features/equipos/components/EquipoMembersCard";
import { EquipoProjectsCard } from "@/features/equipos/components/EquipoProjectsCard";
import { EquipoMembersModal } from "@/features/equipos/components/EquipoMembersModal";
import styles from "./EquipoDetailPage.module.css";

const PROJECT_FILTER_KEY = "proyectos.selectedTeamId";
const TEAM_DESCRIPTION_KEY_PREFIX = "equipos.description.";

const getTeamDescriptionStorageKey = (teamId: string) => `${TEAM_DESCRIPTION_KEY_PREFIX}${teamId}`;
const normalizeId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const readStoredTeamDescription = (teamId: string): string | null => {
  try {
    return localStorage.getItem(getTeamDescriptionStorageKey(teamId));
  } catch {
    return null;
  }
};

export const EquipoDetailPage = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();

  const { data: equipos = [], isLoading: equiposLoading } = useEquipos();
  const { data: members = [], isLoading: membersLoading } = useEquipoMembers(teamId ?? "");
  const { data: users = [] } = useUsers();
  const { data: projects = [], isLoading: projectsLoading } = useProyectos(teamId);

  const addMutation = useAddMember(teamId ?? "");
  const removeMutation = useRemoveMember(teamId ?? "");

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [savedDescription, setSavedDescription] = useState("");
  const [saveAlertOpen, setSaveAlertOpen] = useState(false);

  const team = useMemo(
    () => equipos.find((equipo) => equipo.teamId === teamId),
    [equipos, teamId]
  );

  const availableUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          !members.some(
            (member) => normalizeId(member.userId) === normalizeId(user.userId)
          )
      ),
    [users, members]
  );

  useEffect(() => {
    if (!team) {
      return;
    }

    const storedDescription = readStoredTeamDescription(team.teamId);
    const initialDescription = storedDescription ?? team.descripcion ?? "";

    setDescriptionDraft(initialDescription);
    setSavedDescription(initialDescription);
  }, [team]);

  useEffect(() => {
    if (!selectedUserId && availableUsers.length > 0) {
      setSelectedUserId(availableUsers[0].userId);
    }
  }, [availableUsers, selectedUserId]);

  const currentTeamName = team?.nombre ?? "Equipo";
  const currentOwnerName = team?.ownerNombre ?? "Sin propietario";

  const handleBack = () => {
    navigate(ROUTES.equipos);
  };

  const handleOpenProjects = () => {
    if (!teamId) {
      return;
    }

    try {
      localStorage.setItem(PROJECT_FILTER_KEY, teamId);
    } catch {
      // Ignore storage errors.
    }

    navigate(ROUTES.proyectos);
  };

  const handleAddMember = () => {
    if (!selectedUserId) {
      return;
    }

    addMutation.mutate(selectedUserId, {
      onSuccess: () => {
        setAddMemberOpen(false);
        setSelectedUserId("");
      },
    });
  };

  const handleRemoveMember = (userId: string) => {
    removeMutation.mutate(userId);
  };

  const handleSaveDescription = () => {
    if (!teamId) {
      return;
    }

    try {
      localStorage.setItem(getTeamDescriptionStorageKey(teamId), descriptionDraft);
    } catch {
      // Ignore storage errors and keep the UI responsive.
    }

    setSavedDescription(descriptionDraft);
    setSaveAlertOpen(true);
  };

  const handleDeleteTeam = () => {
    // Visual placeholder only: no delete-team endpoint exists in the documented backend.
  };

  if (!teamId) {
    return (
      <div className="App">
        <NavBar />
        <div className={styles.page}>
          <p className={styles.projectEmpty}>No se encontró el equipo solicitado.</p>
        </div>
      </div>
    );
  }

  if (equiposLoading && !team) {
    return (
      <div className="App">
        <NavBar />
        <div className={styles.page}>
          <div className={styles.projectEmpty}>
            <CircularProgress />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <NavBar />

      <div className={styles.page}>
        <EquipoDetailHeader
          teamName={currentTeamName}
          ownerName={currentOwnerName}
          onBack={handleBack}
          onDeleteTeam={handleDeleteTeam}
        />

        <div className={styles.contentGrid}>
          <EquipoDescriptionCard
            value={savedDescription}
            draft={descriptionDraft}
            onChange={setDescriptionDraft}
            onSave={handleSaveDescription}
            canSave={descriptionDraft !== savedDescription}
          />

          <EquipoMembersCard
            members={members as TeamMember[]}
            users={users}
            isLoading={membersLoading}
            onAddMember={() => setAddMemberOpen(true)}
            onRemoveMember={handleRemoveMember}
            isRemoving={removeMutation.isPending}
          />
        </div>

        <div className={styles.bottomGrid}>
          <EquipoProjectsCard
            projects={projects}
            onManageProjects={handleOpenProjects}
            onOpenProject={(projectId) => navigate(`${ROUTES.proyectos}/${projectId}`)}
          />
        </div>
      </div>

      <EquipoMembersModal
        open={addMemberOpen}
        users={availableUsers}
        selectedUserId={selectedUserId}
        onClose={() => setAddMemberOpen(false)}
        onSelectUser={setSelectedUserId}
        onSubmit={handleAddMember}
        isPending={addMutation.isPending}
      />

      <Snackbar
        open={saveAlertOpen}
        autoHideDuration={2500}
        onClose={() => setSaveAlertOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setSaveAlertOpen(false)} variant="filled">
          Descripción guardada correctamente
        </Alert>
      </Snackbar>
    </div>
  );
};
