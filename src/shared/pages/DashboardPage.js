import React from 'react';
import { useTareas } from '../../features/tareas/hooks/useTareas';
import { useProyectos } from '../../features/proyectos/hooks/useProyectos';
import { useEquipos } from '../../features/equipos/hooks/useEquipos';
import { CircularProgress } from '@mui/material';
import NavBar from './NavBar';

// Stat card themes
const STATS = [
  { key: 'activas',   label: 'Tareas activas', bg: '#FFFBEB', border: '#FDE68A', num: '#B45309', sub: '#78350F', icon: '⚡' },
  { key: 'done',      label: 'Completadas',    bg: '#F0FDF4', border: '#86EFAC', num: '#15803D', sub: '#14532D', icon: '✓'  },
  { key: 'proyectos', label: 'Proyectos',      bg: '#EFF6FF', border: '#93C5FD', num: '#1D4ED8', sub: '#1E3A8A', icon: '◈'  },
  { key: 'equipos',   label: 'Equipos',        bg: '#F5F3FF', border: '#C4B5FD', num: '#6D28D9', sub: '#4C1D95', icon: '⬡'  },
];

export default function DashboardPage() {
  const { data: tareas,    isLoading: lt } = useTareas();
  const { data: proyectos, isLoading: lp } = useProyectos();
  const { data: equipos,   isLoading: le } = useEquipos();

  const isLoading         = lt || lp || le;
  const tareasActivas     = (tareas || []).filter((t) => t.estadoId === 1 || t.estadoId === 2);
  const tareasCompletadas = (tareas || []).filter((t) => t.estadoId === 3);

  const values = {
    activas:   tareasActivas.length,
    done:      tareasCompletadas.length,
    proyectos: (proyectos || []).length,
    equipos:   (equipos || []).length,
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

      {isLoading ? <CircularProgress style={{ marginTop: 40 }} /> : (
        <>
          {/* Stat cards */}
          <div className="stat-row">
            {STATS.map(({ key, label, bg, border, num, sub, icon }) => (
              <div key={key} className="stat-card" style={{ background: bg, borderColor: border }}>
                <span className="stat-card-icon" style={{ color: num }}>{icon}</span>
                <span className="stat-card-value" style={{ color: num }}>{values[key]}</span>
                <span className="stat-card-label" style={{ color: sub }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          {tareasActivas.length > 0 && (
            <div className="page-section">
              <span className="section-label">Tareas pendientes</span>
              <table>
                <thead>
                  <tr><th>Título</th><th>Prioridad</th><th>Fecha límite</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {tareasActivas.slice(0, 10).map((t) => (
                    <tr key={t.taskId}>
                      <td className="cell-primary">{t.titulo}</td>
                      <td><PrioBadge id={t.prioridadId} /></td>
                      <td>{t.fechaLimite ? new Date(t.fechaLimite).toLocaleDateString('es-MX') : '—'}</td>
                      <td><StatusBadge id={t.estadoId} /></td>
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
}

function PrioBadge({ id }) {
  const map = {
    1: { bg: '#DC2626', color: '#fff',     label: 'Alta'  },
    2: { bg: '#D97706', color: '#fff',     label: 'Media' },
    3: { bg: '#16A34A', color: '#fff',     label: 'Baja'  },
  };
  const p = map[id] || { bg: '#E4E4E7', color: '#52525B', label: '—' };
  return <span className="badge" style={{ background: p.bg, color: p.color }}>{p.label}</span>;
}

function StatusBadge({ id }) {
  const map = {
    1: { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente'  },
    2: { bg: '#DBEAFE', color: '#1E40AF', label: 'En proceso' },
    3: { bg: '#DCFCE7', color: '#14532D', label: 'Completada' },
    4: { bg: '#F4F4F5', color: '#71717A', label: 'Cancelada'  },
  };
  const p = map[id] || map[1];
  return <span className="badge" style={{ background: p.bg, color: p.color }}>{p.label}</span>;
}
