import { Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import styles from "../pages/EquipoDetailPage.module.css";

interface EquipoDescriptionCardProps {
  value: string;
  draft: string;
  onChange: (value: string) => void;
  onSave: () => void;
  canSave: boolean;
}

export const EquipoDescriptionCard = ({
  value,
  draft,
  onChange,
  onSave,
  canSave,
}: EquipoDescriptionCardProps) => {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderTitle}>
          <h3>Descripción</h3>
          <p>Resumen editable del equipo</p>
        </div>
      </div>

      <div className={styles.cardBody}>
        <textarea
          className={styles.descriptionField}
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          rows={8}
        />

        <p className={styles.descriptionHint}>
          {value.trim() ? "La descripción actual se puede actualizar desde aquí." : "Agrega una descripción para explicar el propósito del equipo."}
        </p>

        <div className={styles.descriptionFooter}>
          <Button
            variant="contained"
            onClick={onSave}
            startIcon={<SaveIcon fontSize="small" />}
            className="AddButton"
            disabled={!canSave}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </section>
  );
};
