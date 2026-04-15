/// src/features/proyectos/pages/ProyectosPage.tsx

import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import { useProyectos, useCreateProyecto } from "@/features/proyectos/hooks/useProyectos";
import { NavBar } from "@/shared/pages/NavBar";
import { AppModal } from "@/shared/components/AppModal";
import { ProjectDashboard } from "@/features/proyectos/components/ProjectDashboard";

// ── Persistence helpers (same pattern as TareasPage) ────────────────────────

const TEAM_STORAGE_KEY = "proyectos.selectedTeamId";
const PROJECT_STORAGE_KEY = "proyectos.selectedProjectId";

const readStoredValue = (key: string): string => {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
};

const persistStoredValue = (key: string, value: string): void => {
  try {
    if (value) {
      localStorage.setItem(key, value);
      return;
    }
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors to keep filtering functional.
  }
};

// ── Constants ───────────────────────────────────────────────────────────────

const EMPTY = { nombre: "", descripcion: "", fechaInicio: "", fechaFin: "" };

// ── Component ────────────────────────────────────────────────────────────────

export const ProyectosPage = () => {
  const { data: equipos, isLoading: loadingEquipos } = useEquipos();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    () => readStoredValue(TEAM_STORAGE_KEY)
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => readStoredValue(PROJECT_STORAGE_KEY)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: proyectos, isLoading: loadingProyectos } = useProyectos(
    selectedTeamId || undefined
  );
  const createMutation = useCreateProyecto(selectedTeamId);

  // ── Persistence effects ────────────────────────────────────────
  useEffect(() => {
    persistStoredValue(TEAM_STORAGE_KEY, selectedTeamId);
  }, [selectedTeamId]);

  useEffect(() => {
    persistStoredValue(PROJECT_STORAGE_KEY, selectedProjectId);
  }, [selectedProjectId]);

  // Validate stored team still exists
  useEffect(() => {
    if (!equipos || !selectedTeamId) return;
    const teamExists = equipos.some((eq) => eq.teamId === selectedTeamId);
    if (!teamExists) {
      setSelectedTeamId("");
      setSelectedProjectId("");
    }
  }, [equipos, selectedTeamId]);

  // Validate stored project still belongs to selected team
  useEffect(() => {
    if (!selectedProjectId) return;
    if (!selectedTeamId) {
      setSelectedProjectId("");
      return;
    }
    if (!proyectos) return;
    const projectExists = proyectos.some((p) => p.projectId === selectedProjectId);
    if (!projectExists) setSelectedProjectId("");
  }, [selectedProjectId, selectedTeamId, proyectos]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedProjectId("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !selectedTeamId) return;
    createMutation.mutate(
      {
        ...form,
        fechaInicio: form.fechaInicio || null,
        fechaFin: form.fechaFin || null,
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          setModalOpen(false);
        },
      }
    );
  };

  // ── Helpers ────────────────────────────────────────────────────────
  const fmtDate = (str: string | null) =>
    str ? new Date(str).toLocaleDateString("es-MX") : "—";

  const progressColor = (pct: number) =>
    pct >= 75 ? "#16A34A" : pct >= 40 ? "#2563EB" : "#D97706";

  const selectedProject = proyectos?.find((p) => p.projectId === selectedProjectId);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="App">
      <NavBar />

      <div className="page-header">
        <div>
          <h2>Proyectos</h2>
          <p className="page-subtitle">Gestión de proyectos y dashboard de KPIs</p>
        </div>
        <Button
          className="AddButton"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          disabled={!selectedTeamId}
        >
          Nuevo proyecto
        </Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span className="section-label" style={{ margin: 0 }}>
          Filtrar por equipo
        </span>
        <FormControl size="small" style={{ minWidth: 200 }}>
          <Select
            value={selectedTeamId}
            displayEmpty
            onChange={(e) => handleTeamChange(e.target.value)}
          >
            <MenuItem value="">
              <em style={{ fontStyle: "normal", color: "#A1A1AA" }}>Seleccionar equipo</em>
            </MenuItem>
            {(equipos || []).map((eq) => (
              <MenuItem key={eq.teamId} value={eq.teamId}>
                {eq.nombre}
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
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <MenuItem value="">
                  <em style={{ fontStyle: "normal", color: "#A1A1AA" }}>Seleccionar proyecto</em>
                </MenuItem>
                {(proyectos || []).map((p) => (
                  <MenuItem key={p.projectId} value={p.projectId}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </div>

      {/* Projects table */}
      <div style={{ width: "100%" }}>
        <span className="section-label">
          Proyectos registrados · {(proyectos || []).length}
        </span>

        {loadingEquipos || loadingProyectos ? (
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
              {(proyectos || []).map((p) => {
                const pct = p.progreso || 0;
                const isActive = p.projectId === selectedProjectId;
                return (
                  <tr
                    key={p.projectId}
                    style={isActive ? { background: "var(--accent-subtle)" } : undefined}
                  >
                    <td className="cell-primary">{p.nombre}</td>
                    <td>{p.descripcion || "—"}</td>
                    <td>
                      <div className="progress-wrap">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${pct}%`, background: progressColor(pct) }}
                          />
                        </div>
                        <span className="progress-label">{pct}%</span>
                      </div>
                    </td>
                    <td>{fmtDate(p.fechaInicio)}</td>
                    <td>{fmtDate(p.fechaFin)}</td>
                    <td>
                      <button
                        onClick={() =>
                          setSelectedProjectId(isActive ? "" : p.projectId)
                        }
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

      {/* Dashboard section */}
      {selectedProjectId && selectedProject && (
        <div style={{ width: "100%"}}>
          <div className="divider" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span className="section-label" style={{ margin: 0 }}>
              Dashboard
            </span>
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-2)",
              }}
            >
              {selectedProject.nombre}
            </span>
          </div>
          <ProjectDashboard projectId={selectedProjectId} />
        </div>
      )}

      {/* Create project modal */}
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo proyecto"
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <TextField
            name="nombre"
            label="Nombre del proyecto"
            value={form.nombre}
            onChange={handleChange}
            required
            size="small"
            fullWidth
          />
          <TextField
            name="descripcion"
            label="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            multiline
            rows={2}
            size="small"
            fullWidth
          />
          <div className="modal-form-row">
            <TextField
              name="fechaInicio"
              label="Fecha inicio"
              type="datetime-local"
              value={form.fechaInicio}
              onChange={handleChange}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              name="fechaFin"
              label="Fecha fin"
              type="datetime-local"
              value={form.fechaFin}
              onChange={handleChange}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            className="AddButton"
            disabled={createMutation.isPending}
            fullWidth
          >
            {createMutation.isPending ? <CircularProgress size={18} /> : "Crear proyecto"}
          </Button>
        </form>
      </AppModal>
    </div>
  );
};