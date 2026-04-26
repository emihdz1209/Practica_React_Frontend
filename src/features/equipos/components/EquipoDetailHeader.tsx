import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "../pages/EquipoDetailPage.module.css";

interface EquipoDetailHeaderProps {
  teamName: string;
  ownerName: string;
  onBack: () => void;
  onDeleteTeam: () => void;
}

export const EquipoDetailHeader = ({
  teamName,
  ownerName,
  onBack,
  onDeleteTeam,
}: EquipoDetailHeaderProps) => {
  return (
    <div className={styles.headerRow}>
      <div className={styles.headerInfo}>
        <Button
          variant="outlined"
          onClick={onBack}
          className={styles.topBackButton}
          startIcon={(
            <span
              aria-hidden="true"
              className={`${styles.buttonIcon} ${styles.arrowBackIcon}`}
            />
          )}
        >
          Volver a equipos
        </Button>

        <span className="section-label">Detalle de equipo</span>
        <h2 className={styles.heroTitle}>{teamName}</h2>
        <div className={styles.ownerMeta}>
          <span className={styles.ownerLabel}>Owner</span>
          <strong className={styles.ownerName}>{ownerName}</strong>
        </div>
      </div>

      <div className={styles.headerActions}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon fontSize="small" />}
          onClick={onDeleteTeam}
          className={styles.dangerButton}
        >
          Eliminar equipo
        </Button>
      </div>
    </div>
  );
};
