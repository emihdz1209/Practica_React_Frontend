import { CircularProgress } from "@mui/material";
import type { Proyecto } from "@/features/proyectos/types/proyecto";
import styles from "@/features/proyectos/styles/ProyectosCardsGrid.module.css";

const fmtDueDate = (value: string | null) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  })
    .format(new Date(value))
    .replace(".", "")
    .toLowerCase();
};

const statusFromProgress = (progress: number) => {
  if (progress >= 75) {
    return {
      label: "On Track",
      className: styles.statusOnTrack,
    };
  }

  if (progress >= 40) {
    return {
      label: "At Risk",
      className: styles.statusAtRisk,
    };
  }

  return {
    label: "Off Track",
    className: styles.statusOffTrack,
  };
};

const progressToneClass = (percentage: number) =>
  percentage >= 75
    ? styles.progressHigh
    : percentage >= 40
      ? styles.progressMedium
      : styles.progressLow;

interface ProyectosCardsGridProps {
  isLoading: boolean;
  isTaskStatsLoading: boolean;
  selectedTeamId: string;
  proyectos: Proyecto[];
  teamNameById: Record<string, string>;
  teamMembersById: Record<string, number>;
  taskStatsByProjectId: Record<string, { completed: number; total: number }>;
  onOpenProject: (projectId: string) => void;
}

export const ProyectosCardsGrid = ({
  isLoading,
  isTaskStatsLoading,
  selectedTeamId,
  proyectos,
  teamNameById,
  teamMembersById,
  taskStatsByProjectId,
  onOpenProject,
}: ProyectosCardsGridProps) => {
  return (
    <section className={styles.section}>
      <span className="section-label">Proyectos · {proyectos.length}</span>

      {isLoading ? (
        <div className={styles.loadingState}>
          <CircularProgress />
        </div>
      ) : proyectos.length === 0 ? (
        <p className={styles.emptyState}>
          {selectedTeamId
            ? "No hay proyectos para el equipo seleccionado."
            : "No hay proyectos registrados."}
        </p>
      ) : (
        <div className={styles.grid}>
          {proyectos.map((proyecto) => {
            const progress = proyecto.progreso ?? 0;
            const status = statusFromProgress(progress);
            const teamMembers = teamMembersById[proyecto.teamId] ?? 0;
            const tasks = taskStatsByProjectId[proyecto.projectId];
            const tasksLabel = isTaskStatsLoading
              ? "—/—"
              : `${tasks?.completed ?? 0}/${tasks?.total ?? 0}`;

            return (
              <button
                key={proyecto.projectId}
                type="button"
                className={styles.card}
                onClick={() => onOpenProject(proyecto.projectId)}
              >
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusBadge} ${status.className}`}>
                    {status.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={styles.headerIcon}
                  />
                </div>

                <h3 className={styles.projectName}>{proyecto.nombre}</h3>
                <p className={styles.teamName}>{teamNameById[proyecto.teamId] ?? "Equipo"}</p>
                <p className={styles.description}>{proyecto.descripcion || "Sin descripción"}</p>

                <div className={styles.progressMeta}>
                  <span>Progreso</span>
                  <strong>{progress}%</strong>
                </div>
                <progress
                  className={`${styles.progressValue} ${progressToneClass(progress)}`}
                  value={progress}
                  max={100}
                />

                <div className={styles.bottomMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabelWithIcon}>
                      <img src="/users.svg" alt="" aria-hidden="true" className={styles.metaIcon} />
                      Team
                    </span>
                    <span className={styles.metaValue}>{teamMembers}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabelWithIcon}>
                      <img
                        src="/circle-dashed-check.svg"
                        alt=""
                        aria-hidden="true"
                        className={styles.metaIcon}
                      />
                      Tasks
                    </span>
                    <span className={styles.metaValue}>{tasksLabel}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabelWithIcon}>
                      <img
                        src="/calendar-due.svg"
                        alt=""
                        aria-hidden="true"
                        className={styles.metaIcon}
                      />
                      Due
                    </span>
                    <span className={styles.metaValue}>{fmtDueDate(proyecto.fechaFin)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
