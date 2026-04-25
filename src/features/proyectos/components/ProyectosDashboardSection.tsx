import { ProjectDashboard } from "@/features/proyectos/components/ProjectDashboard";
import styles from "@/features/proyectos/styles/ProyectosPage.module.css";

interface ProyectosDashboardSectionProps {
  projectId: string;
}

export const ProyectosDashboardSection = ({ projectId }: ProyectosDashboardSectionProps) => {
  return (
    <div className={styles.dashboardSection}>
      <ProjectDashboard projectId={projectId} />
    </div>
  );
};
