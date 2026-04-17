import { CircularProgress } from "@mui/material";
import type { Proyecto } from "@/features/proyectos/types/proyecto";

const fmtDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-MX") : "—";

const progressColor = (percentage: number) =>
  percentage >= 75 ? "#16A34A" : percentage >= 40 ? "#2563EB" : "#D97706";

interface ProyectosTableProps {
  isLoading: boolean;
  selectedTeamId: string;
  selectedProjectId: string;
  detailProjectId: string | null;
  proyectos?: Proyecto[];
  onDetailProjectChange: (project: Proyecto | null) => void;
  onDashboardProjectChange: (projectId: string) => void;
}

export const ProyectosTable = ({
  isLoading,
  selectedTeamId,
  selectedProjectId,
  detailProjectId,
  proyectos,
  onDetailProjectChange,
  onDashboardProjectChange,
}: ProyectosTableProps) => {
  return (
    <div style={{ width: "100%" }}>
      <span className="section-label">
        Proyectos registrados · {(proyectos || []).length}
      </span>

      {isLoading ? (
        <CircularProgress />
      ) : !selectedTeamId ? (
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem", marginTop: 24 }}>
          Selecciona un equipo para ver sus proyectos.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Progreso</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Dashboard</th>
            </tr>
          </thead>
          <tbody>
            {(proyectos || []).map((proyecto) => {
              const progress = proyecto.progreso || 0;
              const isActive = proyecto.projectId === selectedProjectId;
              const isDetailOpen = detailProjectId === proyecto.projectId;

              return (
                <tr
                  key={proyecto.projectId}
                  style={isActive ? { background: "var(--accent-subtle)" } : undefined}
                >
                  <td className="cell-primary">
                    <button
                      onClick={() => onDetailProjectChange(isDetailOpen ? null : proyecto)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontWeight: 600,
                        color: isDetailOpen ? "var(--accent)" : "var(--text-1)",
                        fontSize: "inherit",
                        textDecoration: "underline",
                        textDecorationStyle: "dotted",
                        textUnderlineOffset: 3,
                      }}
                    >
                      {proyecto.nombre}
                    </button>
                  </td>
                  <td>{proyecto.descripcion || "—"}</td>
                  <td>
                    <div className="progress-wrap">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%`, background: progressColor(progress) }}
                        />
                      </div>
                      <span className="progress-label">{progress}%</span>
                    </div>
                  </td>
                  <td>{fmtDate(proyecto.fechaInicio)}</td>
                  <td>{fmtDate(proyecto.fechaFin)}</td>
                  <td>
                    <button
                      onClick={() => onDashboardProjectChange(proyecto.projectId)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "4px 10px",
                        border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: "var(--r-sm)",
                        background: isActive ? "var(--accent-subtle)" : "transparent",
                        color: isActive ? "var(--accent)" : "var(--text-2)",
                        cursor: "pointer",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {isActive ? "Cerrar" : "Ver"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
