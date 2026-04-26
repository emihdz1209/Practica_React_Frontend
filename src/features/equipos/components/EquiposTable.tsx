import { Button, CircularProgress } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import styles from "../pages/EquiposPage.module.css";
import type { Equipo } from "@/features/equipos/types/equipo";

interface EquiposTableProps {
  equipos: Equipo[];
  isLoading: boolean;
  projectCountsByTeamId: Record<string, number>;
  onOpenTeam: (teamId: string) => void;
}

export const EquiposTable = ({
  equipos,
  isLoading,
  projectCountsByTeamId,
  onOpenTeam,
}: EquiposTableProps) => {
  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div className={styles.tableHeaderTitle}>
          <h3>Equipos registrados</h3>
          <p>{equipos.length} equipos disponibles para gestión</p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <CircularProgress />
        </div>
      ) : equipos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay equipos aún. Crea el primero para comenzar.</p>
        </div>
      ) : (
        <div className={styles.gridSection}>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Owner</th>
                <th>Miembros</th>
                <th>Proyectos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((equipo) => (
                <tr key={equipo.teamId}>
                  <td className="cell-primary">{equipo.nombre}</td>
                  <td>{equipo.descripcion || "—"}</td>
                  <td>{equipo.ownerNombre}</td>
                  <td>{equipo.totalMembers}</td>
                  <td>{projectCountsByTeamId[equipo.teamId] ?? 0}</td>
                  <td>
                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                      onClick={() => onOpenTeam(equipo.teamId)}
                    >
                      Ver equipo
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
