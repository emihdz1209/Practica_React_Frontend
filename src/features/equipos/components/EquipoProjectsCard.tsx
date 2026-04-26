import { Button } from "@mui/material";
import type { Proyecto } from "@/features/proyectos/types/proyecto";
import styles from "../pages/EquipoDetailPage.module.css";

interface EquipoProjectsCardProps {
  projects: Proyecto[];
  onManageProjects: () => void;
  onOpenProject: (projectId: string) => void;
}

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-MX") : "—";

export const EquipoProjectsCard = ({
  projects,
  onManageProjects,
  onOpenProject,
}: EquipoProjectsCardProps) => {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderTitle}>
          <h3>Proyectos del equipo</h3>
          <p>{projects.length} asignados</p>
        </div>

        <Button variant="contained" onClick={onManageProjects} className="AddButton">
          Ver todos los proyectos
        </Button>
      </div>

      <div className={styles.cardBody}>
        {projects.length === 0 ? (
          <div className={styles.projectEmpty}>Este equipo aún no tiene proyectos asignados.</div>
        ) : (
          <div className={styles.projectList}>
            {projects.map((project) => (
              <button
                key={project.projectId}
                type="button"
                className={styles.projectRowButton}
                onClick={() => onOpenProject(project.projectId)}
              >
                <div className={styles.projectTop}>
                  <div>
                    <p className={styles.projectName}>{project.nombre}</p>
                    <p className={styles.projectDates}>
                      {formatDate(project.fechaInicio)} · {formatDate(project.fechaFin)}
                    </p>
                  </div>
                </div>

                <div className={styles.projectProgress}>
                  <span>Progreso</span>
                  <div className={styles.projectProgressBar}>
                    <div className={styles.projectProgressFill} style={{ width: `${project.progreso ?? 0}%` }} />
                  </div>
                  <strong>{Math.round(project.progreso ?? 0)}%</strong>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
