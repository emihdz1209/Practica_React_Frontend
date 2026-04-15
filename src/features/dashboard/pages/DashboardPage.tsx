/// src/features/dashboard/pages/DashboardPage.tsx

import React from "react";
import { CircularProgress } from "@mui/material";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import { useAllProyectos } from "@/features/proyectos/hooks/useProyectos";
import { NavBar } from "@/shared/pages/NavBar";

const STATS = [
  { key: "activas",   label: "Proyectos activos", bg: "#FFFBEB", border: "#FDE68A", num: "#B45309", sub: "#78350F", icon: "⚡" },
  { key: "equipos",   label: "Equipos",           bg: "#F5F3FF", border: "#C4B5FD", num: "#6D28D9", sub: "#4C1D95", icon: "⬡" },
  { key: "proyectos", label: "Proyectos",          bg: "#EFF6FF", border: "#93C5FD", num: "#1D4ED8", sub: "#1E3A8A", icon: "◈" },
  { key: "done",      label: "Completados (100%)", bg: "#F0FDF4", border: "#86EFAC", num: "#15803D", sub: "#14532D", icon: "✓" },
];

function PrioBadge({ id }: { id: number }) {
  const map: Record<number, { bg: string; color: string; label: string }> = {
    1: { bg: "#DC2626", color: "#fff", label: "Alta"  },
    2: { bg: "#D97706", color: "#fff", label: "Media" },
    3: { bg: "#16A34A", color: "#fff", label: "Baja"  },
  };
  const p = map[id] || { bg: "#E4E4E7", color: "#52525B", label: "—" };
  return <span className="badge" style={{ background: p.bg, color: p.color }}>{p.label}</span>;
}

function ProgressBadge({ value }: { value: number }) {
  const color = value >= 100 ? "#15803D" : value >= 50 ? "#2563EB" : "#D97706";
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
      <span className="progress-label">{value}%</span>
    </div>
  );
}

export const DashboardPage = () => {
  const { data: equipos, isLoading: le } = useEquipos();
  const teamIds = (equipos || []).map((e) => e.teamId);
  const { data: proyectos, isLoading: lp } = useAllProyectos(teamIds);

  const isLoading = le || lp;

  const proyectosActivos   = proyectos.filter((p) => p.progreso < 100);
  const proyectosCompletados = proyectos.filter((p) => p.progreso >= 100);

  const values = {
    activas:   proyectosActivos.length,
    equipos:   (equipos || []).length,
    proyectos: proyectos.length,
    done:      proyectosCompletados.length,
  };

  return (
    <div className="App">
      <NavBar />

      <div className="page-header">
        <div>
          <h2>Vista General</h2>
          <p className="page-subtitle">Resumen del proyecto</p>
        </div>
      </div>

      {isLoading ? (
        <CircularProgress style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Stat cards */}
          <div className="stat-row">
            {STATS.map(({ key, label, bg, border, num, sub, icon }) => (
              <div key={key} className="stat-card" style={{ background: bg, borderColor: border }}>
                <span className="stat-card-icon" style={{ color: num }}>{icon}</span>
                <span className="stat-card-value" style={{ color: num }}>
                  {values[key as keyof typeof values]}
                </span>
                <span className="stat-card-label" style={{ color: sub }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Projects table */}
          {proyectos.length > 0 && (
            <div className="page-section">
              <span className="section-label">Proyectos en curso</span>
              <table>
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Progreso</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.slice(0, 10).map((p) => (
                    <tr key={p.projectId}>
                      <td className="cell-primary">{p.nombre}</td>
                      <td><ProgressBadge value={p.progreso || 0} /></td>
                      <td>{p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString("es-MX") : "—"}</td>
                      <td>{p.fechaFin    ? new Date(p.fechaFin).toLocaleDateString("es-MX")    : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
