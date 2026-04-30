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

export const AgentProjectSelectorModal = ({
  open,
  onClose,
  selectedOption,
}: AgentProjectSelectorModalProps) => {
  const navigate = useNavigate();
  const { data: equipos = [], isLoading: isEquiposLoading } = useEquipos();
  const generateBacklogMutation = useGenerateAiBacklog();

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [plannedHours, setPlannedHours] = useState(DEFAULT_HOURS);
  const [similarityThreshold, setSimilarityThreshold] = useState(DEFAULT_THRESHOLD);
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
      setSubmitError(null);
    }
  }, [open, selectedOption?.id]);

  const isGenerateTasksOption = selectedOption?.id === "generate-tasks";
  const isDuplicateAnalysisOption = selectedOption?.id === "duplicate-task-analysis";

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
    : false;
  const actionLabel = isGenerateTasksOption
    ? isSubmitting
      ? "Generando..."
      : "Generar tareas"
    : isDuplicateAnalysisOption
      ? "Iniciar analisis completo"
      : "Proximamente";
  const isActionDisabled = isGenerateTasksOption
    ? !selectedProjectId || !isHoursValid || isSubmitting
    : isDuplicateAnalysisOption
      ? !selectedProjectId || !isThresholdValid
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

  const handleGenerateDuplicateReport = () => {
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

    // Navigate to the page and let it orchestrate the full pipeline
    onClose();
    navigate(
      `${ROUTES.agentDuplicateAnalysis}/${selectedProjectId}?startPipeline=true&threshold=${parsedThreshold}`
    );
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
              ? "Selecciona un equipo, un proyecto y define el threshold de similitud para ejecutar los 3 motores de deteccion."
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
            label="Horas de trabajo maximas por tarea"
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
            Se ejecutaran 3 motores de deteccion (LLM, Semantico, Vectorial) para
            comparar resultados. El proceso incluye la preparacion de embeddings.
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
