import { FormControl, MenuItem, Select } from "@mui/material";
import type { Equipo } from "@/features/equipos/types/equipo";
import type { Proyecto } from "@/features/proyectos/types/proyecto";
import styles from "@/features/proyectos/styles/ProyectosFilters.module.css";

interface ProyectosFiltersProps {
  selectedTeamId: string;
  selectedProjectId?: string;
  equipos?: Equipo[];
  proyectos?: Proyecto[];
  showProjectFilter?: boolean;
  onTeamChange: (teamId: string) => void;
  onProjectChange?: (projectId: string) => void;
}

export const ProyectosFilters = ({
  selectedTeamId,
  selectedProjectId,
  equipos,
  proyectos,
  showProjectFilter = true,
  onTeamChange,
  onProjectChange,
}: ProyectosFiltersProps) => {
  return (
    <div className="filter-bar">
      <span className={`section-label ${styles.inlineLabel}`}>
        Filtrar por equipo
      </span>
      <FormControl size="small" className={styles.teamControl}>
        <Select
          value={selectedTeamId}
          displayEmpty
          onChange={(event) => onTeamChange(event.target.value as string)}
        >
          <MenuItem value="">
            <em className={styles.placeholder}>Seleccionar equipo</em>
          </MenuItem>
          {(equipos || []).map((equipo) => (
            <MenuItem key={equipo.teamId} value={equipo.teamId}>
              {equipo.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showProjectFilter && selectedTeamId && (
        <>
          <span className={`section-label ${styles.inlineLabel} ${styles.projectLabel}`}>
            Dashboard del proyecto
          </span>
          <FormControl size="small" className={styles.projectControl}>
            <Select
              value={selectedProjectId ?? ""}
              displayEmpty
              onChange={(event) => onProjectChange?.(event.target.value as string)}
            >
              <MenuItem value="">
                <em className={styles.placeholder}>Seleccionar proyecto</em>
              </MenuItem>
              {(proyectos || []).map((proyecto) => (
                <MenuItem key={proyecto.projectId} value={proyecto.projectId}>
                  {proyecto.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
    </div>
  );
};
