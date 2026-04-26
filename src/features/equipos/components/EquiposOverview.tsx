import styles from "../pages/EquiposPage.module.css";

interface EquiposOverviewProps {
  totalTeams: number;
  totalMembers: number;
  totalProjects: number;
}

export const EquiposOverview = ({ totalTeams, totalMembers, totalProjects }: EquiposOverviewProps) => {
  return (
    <div className={styles.summaryGrid}>
      <article className={styles.summaryCard}>
        <p className={styles.summaryLabel}>Equipos registrados</p>
        <p className={styles.summaryValue}>{totalTeams}</p>
        <p className={styles.summaryHint}>Estructura general del workspace</p>
      </article>

      <article className={styles.summaryCard}>
        <p className={styles.summaryLabel}>Miembros totales</p>
        <p className={styles.summaryValue}>{totalMembers}</p>
        <p className={styles.summaryHint}>Integrantes distribuidos en todos los equipos</p>
      </article>

      <article className={styles.summaryCard}>
        <p className={styles.summaryLabel}>Proyectos activos</p>
        <p className={styles.summaryValue}>{totalProjects}</p>
        <p className={styles.summaryHint}>Contexto de trabajo asociado a los equipos</p>
      </article>
    </div>
  );
};
