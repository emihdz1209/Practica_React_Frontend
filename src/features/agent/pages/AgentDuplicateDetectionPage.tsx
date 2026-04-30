import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { AppModal } from "@/shared/components/AppModal";

import { NavBar } from "@/shared/pages/NavBar";
import { ROUTES } from "@/app/router/routes";
import { useProyecto } from "@/features/proyectos/hooks/useProyectos";
import { useDeleteTarea } from "@/features/tareas/hooks/useTareas";
import {
  getTareaById,
  getTaskUsers,
  removeUserFromTask,
} from "@/features/tareas/services/tareaService";
import {
  useDuplicateDetectionLatest,
  useDuplicateDetectionRunResults,
  useDuplicateDetectionRuns,
} from "@/features/agent/hooks/useAiDuplicateDetection";
import type { DuplicateDetectionRun } from "@/features/agent/types/aiDuplicateDetection";
import { AgentDuplicateDetectionResultsTable } from "@/features/agent/components/AgentDuplicateDetectionResultsTable";
import styles from "@/features/agent/styles/AgentDuplicateDetectionPage.module.css";

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatThreshold = (value?: number) =>
  typeof value === "number" ? value.toFixed(2) : "—";

const formatRunLabel = (run: DuplicateDetectionRun) =>
  `${formatDateTime(run.createdAt)} · ${run.status}`;

const normalizeId = (value: string) => value.trim().toLowerCase();

const statusToneClass = (status?: string) => {
  if (status === "COMPLETED") return styles.statusCompleted;
  if (status === "FAILED") return styles.statusFailed;
  return styles.statusPending;
};

const ANALYZING_MESSAGE = "Analizando tareas duplicadas...";

export const AgentDuplicateDetectionPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRunId, setSelectedRunId] = useState(
    searchParams.get("runId") ?? ""
  );
  const [removedTaskIds, setRemovedTaskIds] = useState<Set<string>>(
    () => new Set()
  );
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRunId(searchParams.get("runId") ?? "");
  }, [searchParams]);

  const { data: project } = useProyecto(projectId);
  const deleteMutation = useDeleteTarea(projectId);

  const {
    data: latestData,
    isLoading: latestLoading,
    isError: latestError,
    error: latestErrorRaw,
  } = useDuplicateDetectionLatest(projectId, selectedRunId ? false : 4000);

  const {
    data: runs = [],
    isLoading: runsLoading,
  } = useDuplicateDetectionRuns(projectId, selectedRunId ? 4000 : false);

  const {
    data: runResults = [],
    isLoading: runResultsLoading,
    isError: runResultsError,
    error: runResultsErrorRaw,
  } = useDuplicateDetectionRunResults(projectId, selectedRunId, selectedRunId ? 4000 : false);

  const selectedRun = useMemo(() => {
    if (!selectedRunId) {
      return latestData?.run ?? runs[0];
    }

    return (
      runs.find((run) => run.runId === selectedRunId) ??
      (latestData?.run?.runId === selectedRunId ? latestData.run : undefined)
    );
  }, [latestData, runs, selectedRunId]);

  const results = selectedRunId ? runResults : latestData?.results ?? [];

  const visibleResults = useMemo(() => {
    if (removedTaskIds.size === 0) return results;

    return results.filter(
      (result) =>
        !removedTaskIds.has(normalizeId(result.taskAId)) &&
        !removedTaskIds.has(normalizeId(result.taskBId))
    );
  }, [removedTaskIds, results]);

  const hasRuns = runs.length > 0 || Boolean(latestData?.run);
  const isResultsLoading = selectedRunId ? runResultsLoading : latestLoading;
  const isResultsError = selectedRunId ? runResultsError : latestError;
  const resultsError = selectedRunId ? runResultsErrorRaw : latestErrorRaw;

  const handleRunChange = (value: string) => {
    setSelectedRunId(value);

    if (!value) {
      setSearchParams({});
      return;
    }

    setSearchParams({ runId: value });
  };

  const handleDeleteTask = async (taskId: string, label: "A" | "B", title: string) => {
    if (!projectId) return;

    // Open confirmation modal instead of native confirm
    setPendingDelete({ taskId, label, title });
  };

  const [pendingDelete, setPendingDelete] =
    useState<null | { taskId: string; label: "A" | "B"; title: string }>(
      null
    );

  const closePendingDelete = () => setPendingDelete(null);

  const performDeleteTask = async () => {
    if (!pendingDelete || !projectId) return;

    const { taskId } = pendingDelete;

    setDeleteError(null);
    setDeletingTaskId(taskId);

    try {
      const task = await getTareaById(taskId);

      if (task.estadoId === 3) {
        setDeleteError("No se puede eliminar una tarea completada.");
        return;
      }

      const assignments = await getTaskUsers(taskId);

      if (assignments.length > 0) {
        await Promise.all(
          assignments.map((assignment) =>
            removeUserFromTask(taskId, assignment.userId)
          )
        );
      }

      await deleteMutation.mutateAsync(taskId);
      setRemovedTaskIds((current) => {
        const next = new Set(current);
        next.add(normalizeId(taskId));
        return next;
      });
      closePendingDelete();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage =
          typeof error.response?.data?.error === "string"
            ? error.response?.data?.error
            : undefined;
        setDeleteError(apiMessage ?? "No se pudo eliminar la tarea. Intenta nuevamente.");
      } else {
        setDeleteError("No se pudo eliminar la tarea. Intenta nuevamente.");
      }
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (!projectId) {
    return (
      <div className="App">
        <NavBar />
        <div className="page-header">
          <div className={styles.headerContent}>
            <div className={styles.headerTopRow}>
              <Button
                variant="outlined"
                onClick={() => navigate(ROUTES.agent)}
                className={styles.topBackButton}
                startIcon={(
                  <span
                    aria-hidden="true"
                    className={`${styles.buttonIcon} ${styles.arrowBackIcon}`}
                  />
                )}
              >
                Volver a Agent
              </Button>
            </div>
            <div>
              <h2>Analisis de tareas duplicadas</h2>
              <p className="page-subtitle">Selecciona un proyecto valido para continuar.</p>
            </div>
          </div>
        </div>
        <Alert severity="warning">No se encontro el proyecto seleccionado.</Alert>
      </div>
    );
  }

  return (
    <div className="App">
      <NavBar />

      <div className="page-header">
        <div className={styles.headerContent}>
          <div className={styles.headerTopRow}>
            <Button
              variant="outlined"
              onClick={() => navigate(ROUTES.agent)}
              className={styles.topBackButton}
              startIcon={(
                <span
                  aria-hidden="true"
                  className={`${styles.buttonIcon} ${styles.arrowBackIcon}`}
                />
              )}
            >
              Volver a Agent
            </Button>
          </div>
          <div>
            <h2>Analisis de tareas duplicadas</h2>
            <p className="page-subtitle">
              Resultados del analisis semantico realizado por IA.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.topRow}>
        <FormControl size="small" className={styles.runSelector} disabled={runsLoading}>
          <InputLabel id="duplicate-run-select-label">Ejecucion</InputLabel>
          <Select
            labelId="duplicate-run-select-label"
            value={selectedRunId}
            label="Ejecucion"
            onChange={(event) => handleRunChange(event.target.value as string)}
          >
            <MenuItem value="">
              <em>Ultima ejecucion</em>
            </MenuItem>
            {runs.map((run) => (
              <MenuItem key={run.runId} value={run.runId}>
                {formatRunLabel(run)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {!hasRuns && !runsLoading && !latestLoading ? (
        <Alert severity="info">
          Aun no hay ejecuciones de analisis para este proyecto. Inicia una desde Agent.
        </Alert>
      ) : (
        <>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Proyecto</span>
              <span className={styles.summaryValue}>
                {project?.nombre ?? "Proyecto seleccionado"}
              </span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Threshold</span>
              <span className={styles.summaryValue}>
                {formatThreshold(selectedRun?.threshold)}
              </span>
              <span className={styles.summaryMeta}>Umbral de similitud</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Tareas analizadas</span>
              <span className={styles.summaryValue}>
                {selectedRun?.tasksAnalyzed ?? "—"}
              </span>
              <span className={styles.summaryMeta}>
                {formatDateTime(selectedRun?.createdAt)}
              </span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Estado</span>
              <span className={`${styles.statusPill} ${statusToneClass(selectedRun?.status)}`}>
                {selectedRun?.status ?? "PENDING"}
              </span>
              <span className={styles.summaryMeta}>
                {selectedRun?.completedAt
                  ? `Finalizado: ${formatDateTime(selectedRun.completedAt)}`
                  : "En proceso"}
              </span>
            </div>
          </div>

          {selectedRun?.status === "PENDING" && (
            <div className={styles.loadingState}>
              <CircularProgress size={28} />
              <p className={styles.loadingText}>{ANALYZING_MESSAGE}</p>
              <p className={styles.loadingHint}>
                Esto puede tardar unos segundos. Mantente en esta pantalla.
              </p>
            </div>
          )}
          {selectedRun?.status === "FAILED" && (
            <Alert severity="error">
              {selectedRun.errorMessage || "La deteccion fallo. Intenta nuevamente."}
            </Alert>
          )}
          {deleteError && <Alert severity="error">{deleteError}</Alert>}

          <div className={styles.resultsHeader}>
            <span className="section-label">
              Posibles duplicados · {visibleResults.length}
            </span>
          </div>

          {isResultsLoading ? (
            <div className={styles.loadingState}>
              <CircularProgress size={26} />
              <p className={styles.loadingText}>Cargando resultados...</p>
            </div>
          ) : isResultsError ? (
            <Alert severity="error">
              {axios.isAxiosError(resultsError) &&
              typeof resultsError.response?.data?.error === "string"
                ? resultsError.response?.data?.error
                : "No se pudieron cargar los resultados."}
            </Alert>
          ) : (
            <AgentDuplicateDetectionResultsTable
              results={visibleResults}
              deletingTaskId={deletingTaskId}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </>
      )}
      <AppModal
        open={Boolean(pendingDelete)}
        onClose={closePendingDelete}
        title="Confirmar eliminación"
      >
        <div style={{ width: "100%" }}>
          <p>
            ¿Eliminar la tarea {pendingDelete?.label}: <strong>{pendingDelete?.title}</strong>? Esta acción no se puede deshacer.
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <Button onClick={closePendingDelete} disabled={Boolean(deletingTaskId)}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={performDeleteTask} disabled={Boolean(deletingTaskId)}>
              {deletingTaskId ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  );
};
