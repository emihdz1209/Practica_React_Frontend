import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, CircularProgress } from "@mui/material";

import { ROUTES } from "@/app/router/routes";
import { NavBar } from "@/shared/pages/NavBar";
import { useProyecto, useProjectSprints } from "@/features/proyectos/hooks/useProyectos";
import { useTaskPriorities } from "@/features/taskPriorities/taskPriorities/hooks/useTaskPriorities";
import { useAiSuggestions } from "@/features/agent/hooks/useAiBacklog";
import { useAiSuggestionsPolling } from "@/features/agent/hooks/useAiSuggestionsPolling";
import { useAiApprovalWorkflow } from "@/features/agent/hooks/useAiApprovalWorkflow";
import {
  EMPTY_SUGGESTIONS,
  getMinFechaLimite,
} from "@/features/agent/utils/agentBacklogUtils";
import { resolvePriorityId } from "@/features/tareas/components/tareasModal/tareasModalUtils";
import { AgentSuggestionsBoard } from "@/features/agent/components/AgentSuggestionsBoard";
import { AgentApprovalModal } from "@/features/agent/components/AgentApprovalModal";
import styles from "@/features/agent/styles/AgentBacklogPage.module.css";

const formatShortDate = (value: string | null | undefined) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
};

export const AgentBacklogPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading: projectLoading } = useProyecto(projectId);
  const {
    data: suggestionsData,
    isLoading: suggestionsLoading,
    isFetching: suggestionsFetching,
    isError: suggestionsError,
    refetch: refetchSuggestions,
  } = useAiSuggestions(projectId);
  const suggestions = suggestionsData ?? EMPTY_SUGGESTIONS;
  const { data: rawPriorities = [], isLoading: prioritiesLoading } = useTaskPriorities();
  const { data: sprints = [], isLoading: sprintsLoading } = useProjectSprints(projectId);

  const priorityOptions = useMemo(() => {
    return (rawPriorities || [])
      .map((priority) => {
        const prioridadId = resolvePriorityId(priority);

        if (prioridadId === null) {
          return null;
        }

        return {
          prioridadId,
          nombre: priority.nombre,
          orden: priority.orden,
        };
      })
      .filter(
        (priority): priority is { prioridadId: number; nombre: string; orden: number } =>
          priority !== null
      )
      .sort((a, b) => a.orden - b.orden);
  }, [rawPriorities]);

  const priorityNameMap = useMemo(
    () => new Map(priorityOptions.map((priority) => [priority.prioridadId, priority.nombre])),
    [priorityOptions]
  );

  const { isWaitingForSuggestions } = useAiSuggestionsPolling({
    suggestionsCount: suggestions.length,
    isFetching: suggestionsFetching,
    isError: suggestionsError,
    refetch: refetchSuggestions,
  });
  const {
    statusMap,
    approvalMap,
    approvalTarget,
    approvalForm,
    setApprovalForm,
    approvalError,
    applyError,
    applySuccess,
    isApplying,
    pendingChanges,
    openApprovalModal,
    handleCloseApprovalModal,
    handleSaveApproval,
    handleStatusChange,
    handleApplyDecisions,
  } = useAiApprovalWorkflow({
    suggestions,
    priorityOptions,
    projectId,
    refetchSuggestions,
  });

  if (!projectId) {
    return (
      <div className="App">
        <NavBar />
        <div className="page-header">
          <div>
            <h2>Agent · Generar tareas</h2>
            <p className="page-subtitle">Selecciona un proyecto valido para continuar.</p>
          </div>
          <Button className="AddButton" onClick={() => navigate(ROUTES.agent)}>
            Volver a Agent
          </Button>
        </div>
        <Alert severity="warning">No se encontro el proyecto seleccionado.</Alert>
      </div>
    );
  }

  return (
    <div className="App">
      <NavBar />

      <div className="page-header">
        <div>
          <h2>Agent · Generar tareas</h2>
          <p className="page-subtitle">
            Revisa las sugerencias, arrastralas y confirma con "Guardar Cambios".
          </p>
        </div>
        <Button
          className="AddButton"
          onClick={handleApplyDecisions}
          disabled={isApplying || suggestionsLoading || pendingChanges === 0}
        >
          {isApplying ? "Procesando..." : "Guardar Cambios"}
        </Button>
      </div>

      <div className={styles.introBar}>
        <div>
          <span className="section-label">Proyecto</span>
          <div className={styles.projectName}>
            {projectLoading ? "Cargando..." : project?.nombre ?? projectId}
          </div>
        </div>
        <div className={styles.introActions}>
          <Button
            size="small"
            onClick={() => refetchSuggestions()}
            disabled={suggestionsLoading}
          >
            Actualizar
          </Button>
          <Button
            size="small"
            onClick={() => navigate(ROUTES.agent)}
            variant="outlined"
          >
            Volver
          </Button>
        </div>
      </div>

      {applyError && (
        <Alert severity="error" className={styles.feedback}>
          {applyError}
        </Alert>
      )}
      {applySuccess && (
        <Alert severity="success" className={styles.feedback}>
          {applySuccess}
        </Alert>
      )}

      <div className={`tareas-layout ${styles.backlogLayout}`}>
        <div className="tareas-main">
          <div className="tareas-board-container">
            {isWaitingForSuggestions ? (
              <div className={styles.loadingState}>
                <CircularProgress size={28} />
                <p className={styles.loadingText}>Generando sugerencias...</p>
                <p className={styles.loadingHint}>
                  Esto puede tardar unos segundos. Mantente en esta pantalla.
                </p>
              </div>
            ) : suggestionsLoading ? (
              <div className={styles.loadingState}>
                <CircularProgress size={28} />
              </div>
            ) : suggestionsError ? (
              <Alert severity="error">
                No se pudieron cargar las sugerencias. Intenta nuevamente.
              </Alert>
            ) : (
              <AgentSuggestionsBoard
                suggestions={suggestions}
                statusMap={statusMap}
                approvalMap={approvalMap}
                priorityNameMap={priorityNameMap}
                formatDate={formatShortDate}
                onStatusChange={handleStatusChange}
                onEditApproval={(aiTaskId) => openApprovalModal(aiTaskId)}
              />
            )}
          </div>
        </div>
      </div>

      <AgentApprovalModal
        open={Boolean(approvalTarget)}
        form={approvalForm}
        onFormChange={setApprovalForm}
        onClose={handleCloseApprovalModal}
        onSave={handleSaveApproval}
        approvalError={approvalError}
        priorities={priorityOptions}
        prioritiesLoading={prioritiesLoading}
        sprints={sprints}
        sprintsLoading={sprintsLoading}
        minFechaLimite={getMinFechaLimite()}
      />
    </div>
  );
};
