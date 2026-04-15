/// src/features/proyectos/pages/ProyectosPage.tsx

import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import {
  useProyectos,
  useCreateProyecto,
  useUpdateProyecto,
  useDeleteProyecto,
} from "@/features/proyectos/hooks/useProyectos";
import type { Proyecto } from "@/features/proyectos/types/proyecto";
import { NavBar } from "@/shared/pages/NavBar";
import { AppModal } from "@/shared/components/AppModal";
import { ProjectDashboard } from "@/features/proyectos/components/ProjectDashboard";

// ── Persistence helpers ──────────────────────────────────────────────────────

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

// ── Constants ────────────────────────────────────────────────────────────────

const EMPTY = { nombre: "", descripcion: "", fechaInicio: "", fechaFin: "" };

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (str: string | null) =>
  str ? new Date(str).toLocaleDateString("es-MX") : "—";

/** Converts an ISO timestamp to the value required by datetime-local inputs */
const toDatetimeLocal = (str: string | null): string => {
  if (!str) return "";
  // Slice to "YYYY-MM-DDTHH:mm"
  return str.slice(0, 16);
};

const progressColor = (pct: number) =>
  pct >= 75 ? "#16A34A" : pct >= 40 ? "#2563EB" : "#D97706";

// ── ProjectDetailModal ───────────────────────────────────────────────────────

interface DetailModalProps {
  project: Proyecto;
  onClose: () => void;
  onProjectDeleted: () => void;
  teamId: string;
}

const ProjectDetailModal = ({ project, onClose, onProjectDeleted, teamId }: DetailModalProps) => {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    nombre: project.nombre,
    descripcion: project.descripcion ?? "",
    fechaInicio: toDatetimeLocal(project.fechaInicio),
    fechaFin: toDatetimeLocal(project.fechaFin),
  });

  const updateMutation = useUpdateProyecto(teamId);
  const deleteMutation = useDeleteProyecto(teamId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    updateMutation.mutate(
      {
        projectId: project.projectId,
        data: {
          nombre: form.nombre,
          descripcion: form.descripcion,
          fechaInicio: form.fechaInicio || null,
          fechaFin: form.fechaFin || null,
        },
      },
      {
        onSuccess: () => {
          setEditing(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(project.projectId, {
      onSuccess: () => {
        onProjectDeleted();
        onClose();
      },
    });
  };

  const pct = project.progreso || 0;

  return (
    <AppModal open onClose={onClose} title={editing ? "Editar proyecto" : project.nombre}>
      {!editing ? (
        /* ── Detail view ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Progress */}
          <div>
            <span
              style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "var(--text-3)" }}
            >
              Progreso
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <div className="progress-track" style={{ flex: 1 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: progressColor(pct) }}
                />
              </div>
              <span style={{ fontWeight: 700, color: progressColor(pct), minWidth: 36 }}>
                {pct}%
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <span
              style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "var(--text-3)" }}
            >
              Descripción
            </span>
            <p style={{ marginTop: 4, fontSize: "0.88rem", color: "var(--text-1)", lineHeight: 1.5 }}>
              {project.descripcion || "Sin descripción"}
            </p>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <span
                style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--text-3)" }}
              >
                Fecha inicio
              </span>
              <p style={{ marginTop: 4, fontSize: "0.88rem", color: "var(--text-1)" }}>
                {fmtDate(project.fechaInicio)}
              </p>
            </div>
            <div>
              <span
                style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--text-3)" }}
              >
                Fecha fin
              </span>
              <p style={{ marginTop: 4, fontSize: "0.88rem", color: "var(--text-1)" }}>
                {fmtDate(project.fechaFin)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
              size="small"
            >
              Editar
            </Button>

            {!confirmDelete ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}
                size="small"
              >
                Eliminar
              </Button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>
                  ¿Confirmar eliminación?
                </span>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? <CircularProgress size={14} /> : "Sí, eliminar"}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Edit form ── */
        <form onSubmit={handleSave} className="modal-form">
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
            rows={3}
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

          <div style={{ display: "flex", gap: 10 }}>
            <Button
              type="submit"
              variant="contained"
              className="AddButton"
              disabled={updateMutation.isPending}
              fullWidth
            >
              {updateMutation.isPending ? <CircularProgress size={18} /> : "Guardar cambios"}
            </Button>
            <Tooltip title="Cancelar edición">
              <IconButton onClick={() => setEditing(false)} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </form>
      )}
    </AppModal>
  );
};

// ── ProyectosPage ─────────────────────────────────────────────────────────────

export const ProyectosPage = () => {
  const { data: equipos, isLoading: loadingEquipos } = useEquipos();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    () => readStoredValue(TEAM_STORAGE_KEY)
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => readStoredValue(PROJECT_STORAGE_KEY)
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Proyecto | null>(null);
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
          setCreateModalOpen(false);
        },
      }
    );
  };

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
          onClick={() => setCreateModalOpen(true)}
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
                    <td className="cell-primary">
                      {/* Clickable name → opens detail modal */}
                      <button
                        onClick={() => setDetailProject(p)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontWeight: 600,
                          color: "var(--accent)",
                          fontSize: "inherit",
                          textDecoration: "underline",
                          textDecorationStyle: "dotted",
                          textUnderlineOffset: 3,
                        }}
                      >
                        {p.nombre}
                      </button>
                    </td>
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
        <div style={{ width: "100%" }}>
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
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
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

      {/* Project detail / edit modal */}
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          teamId={selectedTeamId}
          onClose={() => setDetailProject(null)}
          onProjectDeleted={() => {
            // If the deleted project was the active dashboard, deselect it
            if (detailProject.projectId === selectedProjectId) {
              setSelectedProjectId("");
            }
            setDetailProject(null);
          }}
        />
      )}
    </div>
  );
};