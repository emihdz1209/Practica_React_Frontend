import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { AppModal } from "@/shared/components/AppModal";
import { ROUTES } from "@/app/router/routes";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import { useProyectos } from "@/features/proyectos/hooks/useProyectos";
import { useGenerateAiBacklog } from "@/features/agent/hooks/useAiBacklog";
import { useStartDuplicateDetection } from "@/features/agent/hooks/useAiDuplicateDetection";
import type { AgentOption } from "@/features/agent/components/AgentOptionsGrid";
import styles from "@/features/agent/styles/AgentProjectSelectorModal.module.css";

interface AgentProjectSelectorModalProps {
  open: boolean;
  onClose: () => void;
  selectedOption: AgentOption | null;
}

const DEFAULT_HOURS = "4";
const MAX_HOURS = 48;
const DEFAULT_THRESHOLD = "0.88";
const MIN_THRESHOLD = 0;
const MAX_THRESHOLD = 1;

const DUPLICATE_METHODS = [
  { value: "all", label: "Los 3 en paralelo" },
  { value: "duplicate-detection", label: "Tradicional" },
  { value: "semantic-duplicate-detection", label: "Semántico" },
  { value: "vector-duplicate-detection", label: "Vectorial Oracle" },
];

export const AgentProjectSelectorModal = ({
  open,
  onClose,
  selectedOption,
}: AgentProjectSelectorModalProps) => {
  const navigate = useNavigate();
  const { data: equipos = [], isLoading: isEquiposLoading } = useEquipos();
  const generateBacklogMutation = useGenerateAiBacklog();
  const traditionalDuplicateDetectionMutation = useStartDuplicateDetection("duplicate-detection");
  const semanticDuplicateDetectionMutation = useStartDuplicateDetection("semantic-duplicate-detection");
  const vectorDuplicateDetectionMutation = useStartDuplicateDetection("vector-duplicate-detection");

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [plannedHours, setPlannedHours] = useState(DEFAULT_HOURS);
  const [similarityThreshold, setSimilarityThreshold] = useState(DEFAULT_THRESHOLD);
  const [duplicateMethod, setDuplicateMethod] = useState(DUPLICATE_METHODS[0].value);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: proyectos = [], isLoading: isProyectosLoading } = useProyectos(
    selectedTeamId
  );

  useEffect(() => {
    setSelectedProjectId("");
  }, [selectedTeamId]);

  useEffect(() => {
    if (!open) {
      setSelectedTeamId("");
      setSelectedProjectId("");
      setPlannedHours(DEFAULT_HOURS);
      setSimilarityThreshold(DEFAULT_THRESHOLD);
      setDuplicateMethod(DUPLICATE_METHODS[0].value);
      setSubmitError(null);
    }
  }, [open, selectedOption?.id]);

  const isGenerateTasksOption = selectedOption?.id === "generate-tasks";
  const isDuplicateAnalysisOption = selectedOption?.id === "duplicate-task-analysis";

  const isRunningAllMethods = duplicateMethod === "all";
  const isSubmittingDuplicateAnalysis = isRunningAllMethods
    ? traditionalDuplicateDetectionMutation.isPending ||
      semanticDuplicateDetectionMutation.isPending ||
      vectorDuplicateDetectionMutation.isPending
    : {
        "duplicate-detection": traditionalDuplicateDetectionMutation.isPending,
        "semantic-duplicate-detection": semanticDuplicateDetectionMutation.isPending,
        "vector-duplicate-detection": vectorDuplicateDetectionMutation.isPending,
      }[duplicateMethod] ?? false;

  const selectedTeamName = useMemo(
    () => equipos.find((equipo) => equipo.teamId === selectedTeamId)?.nombre ?? "",
    [equipos, selectedTeamId]
  );

  const selectedProjectName = useMemo(
    () =>
      proyectos.find((proyecto) => proyecto.projectId === selectedProjectId)?.nombre ??
      "",
    [proyectos, selectedProjectId]
  );

  const parsedHours = Number(plannedHours);
  const trimmedThreshold = similarityThreshold.trim();
  const parsedThreshold = Number(trimmedThreshold);
  const isHoursValid =
    Number.isFinite(parsedHours) && parsedHours > 0 && parsedHours <= MAX_HOURS;
  const isThresholdValid =
    trimmedThreshold.length > 0 &&
    Number.isFinite(parsedThreshold) &&
    parsedThreshold >= MIN_THRESHOLD &&
    parsedThreshold <= MAX_THRESHOLD;
  const isSubmitting = isGenerateTasksOption
    ? generateBacklogMutation.isPending
    : isSubmittingDuplicateAnalysis;
  const actionLabel = isGenerateTasksOption
    ? isSubmitting
      ? "Generando..."
      : "Generar tareas"
    : isDuplicateAnalysisOption
      ? isSubmittingDuplicateAnalysis
        ? "Generando..."
        : duplicateMethod === "all"
          ? "Generar los 3 reportes"
          : "Generar reporte"
      : "Proximamente";
  const isActionDisabled = isGenerateTasksOption
    ? !selectedProjectId || !isHoursValid || isSubmitting
    : isDuplicateAnalysisOption
      ? !selectedProjectId || !isThresholdValid || isSubmittingDuplicateAnalysis
      : true;

  const handleGenerateTasks = async () => {
    setSubmitError(null);

    if (!selectedProjectId) {
      setSubmitError("Selecciona un proyecto para continuar.");
      return;
    }

    if (!isHoursValid) {
      setSubmitError(`Ingresa horas validas entre 1 y ${MAX_HOURS}.`);
      return;
    }

    try {
      await generateBacklogMutation.mutateAsync({
        projectId: selectedProjectId,
        maxHours: parsedHours,
      });

      onClose();
      navigate(`${ROUTES.agentBacklog}/${selectedProjectId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage =
          typeof error.response?.data?.error === "string"
            ? error.response?.data?.error
            : undefined;

        setSubmitError(apiMessage ?? "No se pudo iniciar la generacion. Intenta nuevamente.");
        return;
      }

      setSubmitError("No se pudo iniciar la generacion. Intenta nuevamente.");
    }
  };

  const handleGenerateDuplicateReport = async () => {
    setSubmitError(null);

    if (!selectedProjectId) {
      setSubmitError("Selecciona un proyecto para continuar.");
      return;
    }

    if (!isThresholdValid) {
      setSubmitError(
        `Ingresa un threshold valido entre ${MIN_THRESHOLD} y ${MAX_THRESHOLD}.`
      );
      return;
    }

    try {
      if (duplicateMethod === "all") {
        await Promise.all([
          traditionalDuplicateDetectionMutation.mutateAsync({
            projectId: selectedProjectId,
            threshold: parsedThreshold,
          }),
          semanticDuplicateDetectionMutation.mutateAsync({
            projectId: selectedProjectId,
            threshold: parsedThreshold,
          }),
          vectorDuplicateDetectionMutation.mutateAsync({
            projectId: selectedProjectId,
            threshold: parsedThreshold,
          }),
        ]);
      } else if (duplicateMethod === "semantic-duplicate-detection") {
        await semanticDuplicateDetectionMutation.mutateAsync({
          projectId: selectedProjectId,
          threshold: parsedThreshold,
        });
      } else if (duplicateMethod === "vector-duplicate-detection") {
        await vectorDuplicateDetectionMutation.mutateAsync({
          projectId: selectedProjectId,
          threshold: parsedThreshold,
        });
      } else {
        await traditionalDuplicateDetectionMutation.mutateAsync({
          projectId: selectedProjectId,
          threshold: parsedThreshold,
        });
      }

      onClose();
      navigate(`${ROUTES.agentDuplicateAnalysis}/${selectedProjectId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage =
          typeof error.response?.data?.error === "string"
            ? error.response?.data?.error
            : undefined;

        // Check for specific error about task embeddings
        if (apiMessage?.toLowerCase().includes("embedding")) {
          setSubmitError(
            "El análisis vectorial requiere embeddings. Contacta al administrador para ejecutar el backfill de embeddings del proyecto primero: POST /api/projects/{projectId}/ai/task-embeddings/backfill"
          );
          return;
        }

        setSubmitError(apiMessage ?? "No se pudo iniciar el analisis. Intenta nuevamente.");
        return;
      }

      setSubmitError("No se pudo iniciar el analisis. Intenta nuevamente.");
    }
  };

  const handlePrimaryAction = () => {
    if (isGenerateTasksOption) {
      handleGenerateTasks();
      return;
    }

    if (isDuplicateAnalysisOption) {
      handleGenerateDuplicateReport();
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Agent · ${selectedOption?.title ?? "Seleccionar contexto"}`}
    >
      <div className={styles.container}>
        <p className={styles.helperText}>
          {isGenerateTasksOption
            ? "Selecciona un equipo, un proyecto y define las horas disponibles para iniciar la generacion."
            : isDuplicateAnalysisOption
              ? "Selecciona un equipo, un proyecto y define el threshold de similitud para iniciar el analisis."
              : "Selecciona un equipo para cargar sus proyectos."}
        </p>

        {isEquiposLoading ? (
          <div className={styles.loadingState}>
            <CircularProgress size={24} />
          </div>
        ) : (
          <FormControl size="small" fullWidth>
            <InputLabel id="agent-team-select-label">Equipo</InputLabel>
            <Select
              labelId="agent-team-select-label"
              value={selectedTeamId}
              label="Equipo"
              onChange={(event) => setSelectedTeamId(event.target.value as string)}
            >
              <MenuItem value="">
                <em>Seleccionar equipo</em>
              </MenuItem>
              {equipos.map((equipo) => (
                <MenuItem key={equipo.teamId} value={equipo.teamId}>
                  {equipo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedTeamId ? (
          <FormControl size="small" fullWidth disabled={isProyectosLoading}>
            <InputLabel id="agent-project-select-label">Proyecto</InputLabel>
            <Select
              labelId="agent-project-select-label"
              value={selectedProjectId}
              label="Proyecto"
              onChange={(event) => setSelectedProjectId(event.target.value as string)}
            >
              <MenuItem value="">
                <em>
                  {isProyectosLoading
                    ? "Cargando proyectos..."
                    : "Seleccionar proyecto"}
                </em>
              </MenuItem>
              {proyectos.map((proyecto) => (
                <MenuItem key={proyecto.projectId} value={proyecto.projectId}>
                  {proyecto.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <p className={styles.pendingText}>Selecciona un equipo para continuar.</p>
        )}

        {isGenerateTasksOption && (
          <TextField
            type="number"
            size="small"
            label="Horas de trabajo máximas por tarea"
            value={plannedHours}
            onChange={(event) => setPlannedHours(event.target.value)}
            disabled={!selectedProjectId}
            fullWidth
            slotProps={{
              htmlInput: {
                min: 1,
                max: MAX_HOURS,
                step: 1,
              },
            }}
          />
        )}

        {isDuplicateAnalysisOption && (
          <div>
            <FormControl size="small" fullWidth>
              <InputLabel id="agent-duplicate-method-label">Metodo</InputLabel>
              <Select
                labelId="agent-duplicate-method-label"
                value={duplicateMethod}
                label="Metodo"
                onChange={(event) => setDuplicateMethod(event.target.value as string)}
              >
                {DUPLICATE_METHODS.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div style={{ height: 12 }} />
            <TextField
              type="number"
              size="small"
              label="Threshold de similitud (0 - 1)"
              value={similarityThreshold}
              onChange={(event) => setSimilarityThreshold(event.target.value)}
              disabled={!selectedProjectId}
              fullWidth
              slotProps={{
                htmlInput: {
                  min: MIN_THRESHOLD,
                  max: MAX_THRESHOLD,
                  step: 0.01,
                },
              }}
            />
            <p className={styles.thresholdHint}>
              Sugerido 0.88 para reducir falsos positivos.
            </p>
          </div>
        )}

        {submitError && (
          <Alert severity="error" className={styles.placeholderAlert}>
            {submitError}
          </Alert>
        )}

        {isGenerateTasksOption ? (
          <Alert severity="info" className={styles.placeholderAlert}>
            La IA generara sugerencias basadas en los documentos del proyecto.
            {selectedTeamName ? ` Equipo: ${selectedTeamName}.` : ""}
            {selectedProjectName ? ` Proyecto: ${selectedProjectName}.` : ""}
          </Alert>
        ) : isDuplicateAnalysisOption ? (
          <Alert severity="info" className={styles.placeholderAlert}>
            La IA analizara las tareas del proyecto para detectar posibles duplicados.
            {selectedTeamName ? ` Equipo: ${selectedTeamName}.` : ""}
            {selectedProjectName ? ` Proyecto: ${selectedProjectName}.` : ""}
          </Alert>
        ) : (
          <Alert severity="info" className={styles.placeholderAlert}>
            <strong>En desarrollo:</strong> las funcionalidades de IA se habilitaran en la
            siguiente fase.
            {selectedTeamName ? ` Equipo: ${selectedTeamName}.` : ""}
            {selectedProjectName ? ` Proyecto: ${selectedProjectName}.` : ""}
          </Alert>
        )}

        <Button
          className="AddButton"
          disabled={isActionDisabled}
          fullWidth
          onClick={handlePrimaryAction}
        >
          {actionLabel}
        </Button>
      </div>
    </AppModal>
  );
};
