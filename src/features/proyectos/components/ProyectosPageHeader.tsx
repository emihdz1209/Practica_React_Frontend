import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface ProyectosPageHeaderProps {
  onCreateProject: () => void;
  isCreateDisabled: boolean;
}

export const ProyectosPageHeader = ({
  onCreateProject,
  isCreateDisabled,
}: ProyectosPageHeaderProps) => {
  return (
    <div className="page-header">
      <div>
        <h2>Proyectos</h2>
        <p className="page-subtitle">Explora todos los proyectos y abre su dashboard de KPIs</p>
      </div>
      <Button
        className="AddButton"
        startIcon={<AddIcon />}
        onClick={onCreateProject}
        disabled={isCreateDisabled}
      >
        Nuevo proyecto
      </Button>
    </div>
  );
};
