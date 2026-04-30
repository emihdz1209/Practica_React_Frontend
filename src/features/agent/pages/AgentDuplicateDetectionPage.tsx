import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Button,
  CircularProgress,
  LinearProgress,
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
  backfillTaskEmbeddings,
  backfillVectorEmbeddings,
  getEmbeddingsStatus,
  startDuplicateDetection,
  getDuplicateDetectionLatest,
  startSemanticDuplicateDetection,
  getSemanticDuplicateDetectionLatest,
  startVectorDuplicateDetection,
  getVectorDuplicateDetectionLatest,
} from "@/features/agent/services/aiDuplicateDetectionService";
import type {
  DuplicateDetectionLatestResponse,
  DuplicateDetectionResult,
  PipelineStep,
} from "@/features/agent/types/aiDuplicateDetection";
import { AgentDuplicateDetectionResultsTable } from "@/features/agent/components/AgentDuplicateDetectionResultsTable";
import styles from "@/features/agent/styles/AgentDuplicateDetectionPage.module.css";

const normalizeId = (value: string) => value.trim().toLowerCase();

const PIPELINE_LABELS: Record<PipelineStep, string> = {
  idle: "",
  backfill_semantic: "Generando embeddings semanticos...",
  waiting_semantic: "Esperando embeddings semanticos...",
  backfill_vector: "Preparando vectores en Oracle...",
  waiting_vector: "Confirmando Oracle Vector Search...",
  running_engines: "Ejecutando motores de deteccion...",
  completed: "Comparacion completada.",
  error: "Error en el proceso.",
};

const PIPELINE_PROGRESS: Record<PipelineStep, number> = {
  idle: 0,
  backfill_semantic: 10,
  waiting_semantic: 25,
  backfill_vector: 40,
  waiting_vector: 55,
  running_engines: 70,
  completed: 100,
  error: 0,
};

type EngineKey = "llm" | "semantic" | "vector";

const ENGINE_META: { key: EngineKey; title: string; description: string }[] = [
  {
    key: "llm",
    title: "LLM Directo",
    description: "Analisis directo con modelo de lenguaje.",
  },
  {
    key: "semantic",
    title: "Python Embeddings",
    description: "Comparacion basada en embeddings semanticos.",
  },
  {
    key: "vector",
    title: "Oracle AI Vector Search",
    description: "Busqueda vectorial nativa de Oracle Database.",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollForSemanticEmbeddings(projectId: string): Promise<void> {
  for (;;) {
    const status = await getEmbeddingsStatus(projectId);
    if (status.semanticEmbeddings >= status.totalTasks && status.totalTasks > 0)
      return;
    await delay(3000);
  }
}

async function pollForVectorEmbeddings(projectId: string): Promise<void> {
  for (;;) {
    const status = await getEmbeddingsStatus(projectId);
    if (
      status.readyForVectorSearch &&
      status.vectorEmbeddings >= status.totalTasks &&
      status.totalTasks > 0
    )
      return;
    await delay(3000);
  }
}

async function pollEngineLatest(
  fetcher: (pid: string) => Promise<DuplicateDetectionLatestResponse>,
  projectId: string
): Promise<DuplicateDetectionLatestResponse> {
  for (;;) {
    const result = await fetcher(projectId);
    if (result.run?.status === "COMPLETED" || result.run?.status === "FAILED") {
      return result;
    }
    await delay(3000);
  }
}

export const AgentDuplicateDetectionPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [removedTaskIds, setRemovedTaskIds] = useState<Set<string>>(
    () => new Set()
  );
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<null | {
    taskId: string;
    label: "A" | "B";
    title: string;
  }>(null);

  // Pipeline state
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const pipelineRanRef = useRef(false);

  // Results from 3 engines
  const [llmData, setLlmData] =
    useState<DuplicateDetectionLatestResponse | null>(null);
  const [semanticData, setSemanticData] =
    useState<DuplicateDetectionLatestResponse | null>(null);
  const [vectorData, setVectorData] =
    useState<DuplicateDetectionLatestResponse | null>(null);

  // Collapsed panels
  const [collapsedEngines, setCollapsedEngines] = useState<
    Record<EngineKey, boolean>
  >({
    llm: false,
    semantic: false,
    vector: false,
  });

  const { data: project } = useProyecto(projectId);
  const deleteMutation = useDeleteTarea(projectId);

  const shouldStartPipeline = searchParams.get("startPipeline") === "true";
  const threshold = Number(searchParams.get("threshold") ?? "0.88");

  // Full pipeline execution
  const runPipeline = useCallback(
    async (pid: string, th: number) => {
      try {
        setPipelineStep("backfill_semantic");
        await backfillTaskEmbeddings(pid);

        setPipelineStep("waiting_semantic");
        await pollForSemanticEmbeddings(pid);

        setPipelineStep("backfill_vector");
        await backfillVectorEmbeddings(pid);

        setPipelineStep("waiting_vector");
        await pollForVectorEmbeddings(pid);

        setPipelineStep("running_engines");
        const payload = { threshold: th };

        await Promise.all([
          startDuplicateDetection(pid, payload),
          startSemanticDuplicateDetection(pid, payload),
          startVectorDuplicateDetection(pid, payload),
        ]);

        const [llmResult, semanticResult, vectorResult] = await Promise.all([
          pollEngineLatest(getDuplicateDetectionLatest, pid),
          pollEngineLatest(getSemanticDuplicateDetectionLatest, pid),
          pollEngineLatest(getVectorDuplicateDetectionLatest, pid),
        ]);

        setLlmData(llmResult);
        setSemanticData(semanticResult);
        setVectorData(vectorResult);
        setPipelineStep("completed");
      } catch (error) {
        setPipelineStep("error");
        if (axios.isAxiosError(error)) {
          const apiMsg =
            typeof error.response?.data?.error === "string"
              ? error.response.data.error
              : undefined;
          setPipelineError(
            apiMsg ?? "Error durante el proceso de analisis."
          );
        } else {
          setPipelineError(
            "Error inesperado durante el proceso de analisis."
          );
        }
      }
    },
    []
  );

  // Auto-start pipeline from modal navigation
  useEffect(() => {
    if (shouldStartPipeline && projectId && !pipelineRanRef.current) {
      pipelineRanRef.current = true;
      runPipeline(projectId, threshold);
    }
  }, [shouldStartPipeline, projectId, threshold, runPipeline]);

  // Direct navigation — load latest results without running pipeline
  useEffect(() => {
    if (!shouldStartPipeline && projectId && !pipelineRanRef.current) {
      pipelineRanRef.current = true;
      setPipelineStep("running_engines");

      Promise.all([
        getDuplicateDetectionLatest(projectId).catch(() => null),
        getSemanticDuplicateDetectionLatest(projectId).catch(() => null),
        getVectorDuplicateDetectionLatest(projectId).catch(() => null),
      ]).then(([llm, semantic, vector]) => {
        setLlmData(llm);
        setSemanticData(semantic);
        setVectorData(vector);
        setPipelineStep("completed");
      });
    }
  }, [shouldStartPipeline, projectId]);

  // Filter results by removed task IDs — shared across all 3 engines
  const filterResults = useCallback(
    (results: DuplicateDetectionResult[]) => {
      if (removedTaskIds.size === 0) return results;
      return results.filter(
        (r) =>
          !removedTaskIds.has(normalizeId(r.taskAId)) &&
          !removedTaskIds.has(normalizeId(r.taskBId))
      );
    },
    [removedTaskIds]
  );

  const llmResults = useMemo(
    () => filterResults(llmData?.results ?? []),
    [filterResults, llmData]
  );
  const semanticResults = useMemo(
    () => filterResults(semanticData?.results ?? []),
    [filterResults, semanticData]
  );
  const vectorResults = useMemo(
    () => filterResults(vectorData?.results ?? []),
    [filterResults, vectorData]
  );

  const resultsByEngine: Record<EngineKey, DuplicateDetectionResult[]> = {
    llm: llmResults,
    semantic: semanticResults,
    vector: vectorResults,
  };

  const dataByEngine: Record<
    EngineKey,
    DuplicateDetectionLatestResponse | null
  > = {
    llm: llmData,
    semantic: semanticData,
    vector: vectorData,
  };

  const handleDeleteTask = (
    taskId: string,
    label: "A" | "B",
    title: string
  ) => {
    if (!projectId) return;
    setPendingDelete({ taskId, label, title });
  };

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
          assignments.map((a) => removeUserFromTask(taskId, a.userId))
        );
      }

      await deleteMutation.mutateAsync(taskId);

      // Add to removed set — filters from ALL 3 engine lists at once
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
        setDeleteError(
          apiMessage ?? "No se pudo eliminar la tarea. Intenta nuevamente."
        );
      } else {
        setDeleteError(
          "No se pudo eliminar la tarea. Intenta nuevamente."
        );
      }
    } finally {
      setDeletingTaskId(null);
    }
  };

  const toggleCollapse = (engine: EngineKey) => {
    setCollapsedEngines((prev) => ({ ...prev, [engine]: !prev[engine] }));
  };

  const isPipelineRunning =
    pipelineStep !== "idle" &&
    pipelineStep !== "completed" &&
    pipelineStep !== "error";

  // --- No project guard ---
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
                startIcon={
                  <span
                    aria-hidden="true"
                    className={`${styles.buttonIcon} ${styles.arrowBackIcon}`}
                  />
                }
              >
                Volver a Agent
              </Button>
            </div>
            <div>
              <h2>Analisis de tareas duplicadas</h2>
              <p className="page-subtitle">
                Selecciona un proyecto valido para continuar.
              </p>
            </div>
          </div>
        </div>
        <Alert severity="warning">
          No se encontro el proyecto seleccionado.
        </Alert>
      </div>
    );
  }

  // --- Pipeline step indicators ---
  const pipelineSteps: PipelineStep[] = [
    "backfill_semantic",
    "waiting_semantic",
    "backfill_vector",
    "waiting_vector",
    "running_engines",
  ];

  const currentStepIndex = pipelineSteps.indexOf(pipelineStep);

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
              startIcon={
                <span
                  aria-hidden="true"
                  className={`${styles.buttonIcon} ${styles.arrowBackIcon}`}
                />
              }
            >
              Volver a Agent
            </Button>
          </div>
          <div>
            <h2>Analisis de tareas duplicadas</h2>
            <p className="page-subtitle">
              Resultados de 3 motores de deteccion de duplicados.
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Proyecto</span>
          <span className={styles.summaryValue}>
            {project?.nombre ?? "Proyecto seleccionado"}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Threshold</span>
          <span className={styles.summaryValue}>{threshold.toFixed(2)}</span>
          <span className={styles.summaryMeta}>Umbral de similitud</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Estado del pipeline</span>
          <span
            className={`${styles.statusPill} ${
              pipelineStep === "completed"
                ? styles.statusCompleted
                : pipelineStep === "error"
                  ? styles.statusFailed
                  : styles.statusPending
            }`}
          >
            {pipelineStep === "completed"
              ? "COMPLETADO"
              : pipelineStep === "error"
                ? "ERROR"
                : "EN PROCESO"}
          </span>
        </div>
      </div>

      {/* Pipeline progress bar */}
      {isPipelineRunning && (
        <div className={styles.pipelineProgress}>
          <LinearProgress
            variant="determinate"
            value={PIPELINE_PROGRESS[pipelineStep]}
            className={styles.progressBar}
          />
          <div className={styles.pipelineSteps}>
            {pipelineSteps.map((step, index) => {
              const isActive = pipelineStep === step;
              const isDone = index < currentStepIndex;

              return (
                <div
                  key={step}
                  className={`${styles.pipelineStepItem} ${
                    isActive ? styles.pipelineStepActive : ""
                  } ${isDone ? styles.pipelineStepDone : ""}`}
                >
                  <span className={styles.pipelineStepNumber}>
                    {isDone ? "\u2713" : index + 1}
                  </span>
                  <span className={styles.pipelineStepLabel}>
                    {PIPELINE_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className={styles.loadingHint}>
            Esto puede tardar unos segundos. Mantente en esta pantalla.
          </p>
        </div>
      )}

      {/* Pipeline error */}
      {pipelineStep === "error" && pipelineError && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {pipelineError}
        </Alert>
      )}

      {/* Delete error */}
      {deleteError && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {deleteError}
        </Alert>
      )}

      {/* 3 engine result panels */}
      {pipelineStep === "completed" && (
        <div className={styles.enginesContainer}>
          {ENGINE_META.map(({ key, title, description }) => {
            const data = dataByEngine[key];
            const results = resultsByEngine[key];
            const isCollapsed = collapsedEngines[key];
            const isFailed = data?.run?.status === "FAILED";

            return (
              <div key={key} className={styles.enginePanel}>
                <button
                  type="button"
                  className={styles.engineHeader}
                  onClick={() => toggleCollapse(key)}
                  aria-expanded={!isCollapsed}
                >
                  <div className={styles.engineHeaderLeft}>
                    <span
                      className={`${styles.engineChevron} ${
                        isCollapsed ? styles.engineChevronCollapsed : ""
                      }`}
                    >
                      &#9660;
                    </span>
                    <span className={styles.engineTitle}>{title}</span>
                    <span className={styles.engineCount}>
                      {isFailed ? "Error" : `${results.length} pares`}
                    </span>
                  </div>
                  <span className={styles.engineDescription}>
                    {description}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className={styles.engineBody}>
                    {!data ? (
                      <p className={styles.emptyState}>
                        No hay resultados disponibles para este motor.
                      </p>
                    ) : isFailed ? (
                      <Alert severity="error">
                        {data.run.errorMessage ??
                          "La deteccion fallo para este motor."}
                      </Alert>
                    ) : (
                      <AgentDuplicateDetectionResultsTable
                        results={results}
                        deletingTaskId={deletingTaskId}
                        onDeleteTask={handleDeleteTask}
                        showDistance={key === "vector"}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading fallback for direct navigation */}
      {isPipelineRunning && pipelineStep === "running_engines" && (
        <div className={styles.loadingState}>
          <CircularProgress size={26} />
          <p className={styles.loadingText}>Cargando resultados...</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      <AppModal
        open={Boolean(pendingDelete)}
        onClose={closePendingDelete}
        title="Confirmar eliminacion"
      >
        <div style={{ width: "100%" }}>
          <p>
            ¿Eliminar la tarea {pendingDelete?.label}:{" "}
            <strong>{pendingDelete?.title}</strong>? Esta accion no se puede
            deshacer.
          </p>
          <p className={styles.deleteWarningHint}>
            La tarea sera eliminada y removida de las 3 listas de resultados.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 16,
            }}
          >
            <Button
              onClick={closePendingDelete}
              disabled={Boolean(deletingTaskId)}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={performDeleteTask}
              disabled={Boolean(deletingTaskId)}
            >
              {deletingTaskId ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </AppModal>
    </div>
  );
};
