import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Button, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/router/routes";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import { ProyectosDashboardSection } from "@/features/proyectos/components/ProyectosDashboardSection";
import { useProyecto } from "@/features/proyectos/hooks/useProyectos";
import styles from "@/features/proyectos/styles/ProyectosDashboardPage.module.css";
import { NavBar } from "@/shared/pages/NavBar";

const progressToneClass = (percentage: number) =>
  percentage >= 75
    ? styles.progressHigh
    : percentage >= 40
      ? styles.progressMedium
      : styles.progressLow;

export const ProyectoDashboardPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const { data: proyecto, isLoading, isError } = useProyecto(projectId);
  const { data: equipos = [] } = useEquipos();

  const teamName = proyecto
    ? equipos.find((equipo) => equipo.teamId === proyecto.teamId)?.nombre ?? proyecto.teamId
    : "";
  const progress = proyecto?.progreso ?? 0;

  const handleBack = () => {
    navigate(ROUTES.proyectos);
  };

  return (
    <div className="App">
      <NavBar />

      <div className={`page-header ${styles.header}`}>
        <div className={styles.headerInfo}>
          <span className={`section-label ${styles.inlineSectionLabel}`}>
            Dashboard de proyecto
          </span>
          <h2>{proyecto?.nombre ?? "Proyecto"}</h2>
          <p className="page-subtitle">
            {proyecto
              ? "KPIs de sprints, progreso y rendimiento del equipo"
              : "Cargando información del proyecto"}
          </p>
          {proyecto && <p className={styles.teamText}>Equipo: {teamName}</p>}
        </div>

        {proyecto ? (
          <div className={styles.headerProgress}>
            <div className={styles.progressMeta}>
              <span>Progreso</span>
              <strong>{progress}%</strong>
            </div>
            <progress
              className={`${styles.progressValue} ${progressToneClass(progress)}`}
              value={progress}
              max={100}
            />
          </div>
        ) : (
          <div className={styles.headerProgressPlaceholder} />
        )}

        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleBack}
          className={styles.backButton}
        >
          Volver a proyectos
        </Button>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <CircularProgress />
        </div>
      ) : isError || !proyecto ? (
        <div className={styles.emptyState}>
          <p>No se pudo cargar el proyecto solicitado.</p>
          <Button variant="outlined" onClick={handleBack}>
            Regresar
          </Button>
        </div>
      ) : (
        <>
          <ProyectosDashboardSection
            projectId={proyecto.projectId}
          />
        </>
      )}
    </div>
  );
};
