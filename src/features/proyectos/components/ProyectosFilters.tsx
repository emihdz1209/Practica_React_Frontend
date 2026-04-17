import { FormControl, MenuItem, Select } from "@mui/material";
import type { Equipo } from "@/features/equipos/types/equipo";
import type { Proyecto } from "@/features/proyectos/types/proyecto";

interface ProyectosFiltersProps {
  selectedTeamId: string;
  selectedProjectId: string;
  equipos?: Equipo[];
  proyectos?: Proyecto[];
  onTeamChange: (teamId: string) => void;
  onProjectChange: (projectId: string) => void;
}

export const ProyectosFilters = ({
  selectedTeamId,
  selectedProjectId,
  equipos,
  proyectos,
  onTeamChange,
  onProjectChange,
}: ProyectosFiltersProps) => {
  return (
    <div className="filter-bar">
      <span className="section-label" style={{ margin: 0 }}>
        Filtrar por equipo
      </span>
      <FormControl size="small" style={{ minWidth: 200 }}>
        <Select
          value={selectedTeamId}
          displayEmpty
          onChange={(event) => onTeamChange(event.target.value as string)}
        >
          <MenuItem value="">
            <em style={{ fontStyle: "normal", color: "#A1A1AA" }}>Seleccionar equipo</em>
          </MenuItem>
          {(equipos || []).map((equipo) => (
            <MenuItem key={equipo.teamId} value={equipo.teamId}>
              {equipo.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedTeamId && (
        <>
          <span className="section-label" style={{ margin: "0 0 0 16px" }}>
            Dashboard del proyecto
          </span>
          <FormControl size="small" style={{ minWidth: 220 }}>
            <Select
              value={selectedProjectId}
              displayEmpty
              onChange={(event) => onProjectChange(event.target.value as string)}
            >
              <MenuItem value="">
                <em style={{ fontStyle: "normal", color: "#A1A1AA" }}>Seleccionar proyecto</em>
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
