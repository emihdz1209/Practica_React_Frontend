import React, { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEquipos } from "@/features/equipos/hooks/useEquipos";
import { useProyectos, useCreateProyecto } from "@/features/proyectos/hooks/useProyectos";
import { NavBar } from "@/shared/pages/NavBar";
import { AppModal } from "@/shared/components/AppModal";

const EMPTY = { nombre: "", descripcion: "", fechaInicio: "", fechaFin: "" };

export const ProyectosPage = () => {
  const { data: equipos, isLoading: loadingEquipos } = useEquipos();
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const { data: proyectos, isLoading: loadingProyectos } = useProyectos(selectedTeamId || undefined);
  const createMutation = useCreateProyecto(selectedTeamId);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

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

  const fmtDate = (str: string | null) =>
    str ? new Date(str).toLocaleDateString("es-MX") : "—";

  const progressColor = (pct: number) =>
    pct >= 75 ? "#16A34A" : pct >= 40 ? "#2563EB" : "#D97706";

  return (
    <div className="App">
      <NavBar />

      <div className="page-header">
        <div>
          <h2>Proyectos</h2>
          <p className="page-subtitle">Gestión de proyectos y progreso</p>
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

      {/* Team filter */}
      <div className="filter-bar">
        <span className="section-label" style={{ margin: 0 }}>
          Filtrar por equipo
        </span>
        <FormControl size="small" style={{ minWidth: 200 }}>
          <Select
            value={selectedTeamId}
            displayEmpty
            onChange={(e) => setSelectedTeamId(e.target.value as string)}
          >
            <MenuItem value="">
              <em style={{ fontStyle: "normal", color: "#A1A1AA" }}>
                Seleccionar equipo
              </em>
            </MenuItem>
            {(equipos || []).map((eq) => (
              <MenuItem key={eq.teamId} value={eq.teamId}>
                {eq.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div style={{ width: "100%" }}>
        <span className="section-label">
          Proyectos registrados · {(proyectos || []).length}
        </span>
        {(loadingEquipos || loadingProyectos) ? (
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
              </tr>
            </thead>
            <tbody>
              {(proyectos || []).map((p) => {
                const pct = p.progreso || 0;
                return (
                  <tr key={p.projectId}>
                    <td className="cell-primary">{p.nombre}</td>
                    <td>{p.descripcion || "—"}</td>
                    <td>
                      <div className="progress-wrap">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${pct}%`,
                              background: progressColor(pct),
                            }}
                          />
                        </div>
                        <span className="progress-label">{pct}%</span>
                      </div>
                    </td>
                    <td>{fmtDate(p.fechaInicio)}</td>
                    <td>{fmtDate(p.fechaFin)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="fechaFin"
              label="Fecha fin"
              type="datetime-local"
              value={form.fechaFin}
              onChange={handleChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </div>
          <Button
            type="submit"
            variant="contained"
            className="AddButton"
            disabled={createMutation.isPending}
            fullWidth
          >
            {createMutation.isPending ? (
              <CircularProgress size={18} />
            ) : (
              "Crear proyecto"
            )}
          </Button>
        </form>
      </AppModal>
    </div>
  );
};
