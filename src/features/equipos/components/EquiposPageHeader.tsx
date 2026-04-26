import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface EquiposPageHeaderProps {
  onCreateEquipo: () => void;
  disableCreate: boolean;
}

export const EquiposPageHeader = ({ onCreateEquipo, disableCreate }: EquiposPageHeaderProps) => {
  return (
    <div className="page-header">
      <div>
        <span className="section-label">Team management</span>
        <h2>Equipos</h2>
        <p className="page-subtitle">Gestión de equipos de trabajo</p>
      </div>

      <Button
        className="AddButton"
        startIcon={<AddIcon />}
        onClick={onCreateEquipo}
        disabled={disableCreate}
      >
        Nuevo equipo
      </Button>
    </div>
  );
};
