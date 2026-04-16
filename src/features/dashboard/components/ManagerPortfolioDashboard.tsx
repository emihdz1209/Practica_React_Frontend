/// src/features/dashboard/components/ManagerPortfolioDashboard.tsx

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import {
  CircularProgress,
  Checkbox,
  ListItemText,
  MenuItem,
  FormControl,
  Select,
  Button,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import ReactECharts from "echarts-for-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useManagedProjects,
  useMultiProjectSprints,
  useMultiProjectSprintKpis,
  useMultiProjectProgress,
  useMultiProjectDevPerformance,
} from "@/features/dashboard/hooks/dashboard";
import type { ManagedProject } from "@/features/dashboard/types/dashboard";

// ── Palette ───────────────────────────────────────────────────────────────────

const PROJECT_COLORS = [
  "#2563eb", "#16a34a", "#d97706", "#7c3aed",
  "#dc2626", "#0891b2", "#ea580c", "#65a30d",
  "#6366f1", "#f43f5e", "#14b8a6", "#a855f7",
];

// ── Component ─────────────────────────────────────────────────────────────────

export const ManagerPortfolioDashboard = () => {
  const { auth } = useAuth();
  const userId = auth.user?.userId;

  const { data: allProjects = [], isLoading: loadingProjects } =
    useManagedProjects(userId);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Auto-select all when projects first load
  const initialized = useState(false);
  if (!initialized[0] && allProjects.length > 0) {
    setSelectedIds(allProjects.map((p) => p.projectId));
    initialized[1](true);
  }

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedIds(typeof value === "string" ? value.split(",") : value);
  };

  const selectAll = () => setSelectedIds(allProjects.map((p) => p.projectId));
  const unselectAll = () => setSelectedIds([]);

  // Build name map for convenience
  const nameMap = useMemo(() => {
    const m: Record<string, string> = {};
    allProjects.forEach((p) => (m[p.projectId] = p.nombre));
    return m;
  }, [allProjects]);

  // ── Data fetching for selected projects ─────────────────────────
  const { data: sprintsByProject, isLoading: loadingSprints } =
    useMultiProjectSprints(selectedIds);

  const { data: kpisByProject, isLoading: loadingKpis } =
    useMultiProjectSprintKpis(sprintsByProject);

  const { data: progressByProject, isLoading: loadingProgress } =
    useMultiProjectProgress(selectedIds);

  const { data: devPerfByProject, isLoading: loadingDevs } =
    useMultiProjectDevPerformance(selectedIds);

  const isLoading =
    loadingProjects || loadingSprints || loadingKpis || loadingProgress || loadingDevs;

  // ── KPI aggregation ─────────────────────────────────────────────
  const kpiAgg = useMemo(() => {
    if (selectedIds.length === 0)
      return {
        avgProgress: 0,
        avgSprintCompletion: 0,
        avgOnTime: 0,
        avgEstimationPrecision: 0,
        totalActiveTasks: 0,
      };

    let totalProgress = 0;
    let totalCompletionRate = 0;
    let totalOnTimeRate = 0;
    let totalPrecision = 0;
    let activeTasks = 0;
    let projectsWithSprints = 0;

    for (const pid of selectedIds) {
      // Progress
      const prog = progressByProject[pid]?.progress ?? 0;
      totalProgress += prog;

      // Sprint KPIs aggregated per project
      const kpis = kpisByProject[pid] ?? [];
      if (kpis.length > 0) {
        projectsWithSprints++;

        let pTotalTareas = 0;
        let pCompletadas = 0;
        let pATiempo = 0;
        let pConRetraso = 0;
        let pEstimado = 0;
        let pReal = 0;

        for (const k of kpis) {
          pTotalTareas += k.totalTareas;
          pCompletadas += k.tareasCompletadas;
          pATiempo += k.aTiempo;
          pConRetraso += k.conRetraso;
          pEstimado += k.totalEstimadoHrs;
          pReal += k.totalRealHrs;
        }

        activeTasks += pTotalTareas;

        if (pTotalTareas > 0) {
          totalCompletionRate += (pCompletadas / pTotalTareas) * 100;
        }
        if (pCompletadas > 0) {
          totalOnTimeRate += (pATiempo / pCompletadas) * 100;
        }
        if (pReal > 0) {
          totalPrecision += pEstimado / pReal;
        }
      }
    }

    const n = selectedIds.length;
    const ns = projectsWithSprints || 1;

    return {
      avgProgress: Math.round(totalProgress / n),
      avgSprintCompletion: Math.round(totalCompletionRate / ns),
      avgOnTime: Math.round(totalOnTimeRate / ns),
      avgEstimationPrecision: (totalPrecision / ns).toFixed(2),
      totalActiveTasks: activeTasks,
    };
  }, [selectedIds, progressByProject, kpisByProject]);

  // ── Chart 1: Delivery Health (Stacked Bar — one column per project) ─────
  const deliveryHealthOption = useMemo(() => {
    const projectNames = selectedIds.map((pid) => nameMap[pid] ?? pid);
    const onTimeData = selectedIds.map((pid) => {
      const kpis = kpisByProject[pid] ?? [];
      return kpis.reduce((sum, k) => sum + k.aTiempo, 0);
    });
    const delayedData = selectedIds.map((pid) => {
      const kpis = kpisByProject[pid] ?? [];
      return kpis.reduce((sum, k) => sum + k.conRetraso, 0);
    });

    return {
      tooltip: { trigger: "axis" as const, axisPointer: { type: "shadow" as const } },
      legend: { data: ["On-time Tasks", "Delayed Tasks"], top: 0, textStyle: { fontSize: 11 } },
      grid: { left: "3%", right: "4%", bottom: "8%", top: "36px", containLabel: true },
      xAxis: {
        type: "category" as const,
        data: projectNames,
        axisLabel: { rotate: projectNames.length > 4 ? 25 : 0, fontSize: 11 },
      },
      yAxis: { type: "value" as const },
      series: [
        {
          name: "On-time Tasks",
          type: "bar" as const,
          stack: "delivery",
          data: onTimeData,
          itemStyle: { color: "#16a34a" },
        },
        {
          name: "Delayed Tasks",
          type: "bar" as const,
          stack: "delivery",
          data: delayedData,
          itemStyle: { color: "#dc2626" },
        },
      ],
    };
  }, [selectedIds, kpisByProject, nameMap]);

  // ── Chart 2: Estimation vs Real (Grouped Bar — one group per project) ───
  const estimationOption = useMemo(() => {
    const projectNames = selectedIds.map((pid) => nameMap[pid] ?? pid);
    const estimatedData = selectedIds.map((pid) => {
      const kpis = kpisByProject[pid] ?? [];
      return Math.round(kpis.reduce((sum, k) => sum + k.totalEstimadoHrs, 0) * 10) / 10;
    });
    const realData = selectedIds.map((pid) => {
      const kpis = kpisByProject[pid] ?? [];
      return Math.round(kpis.reduce((sum, k) => sum + k.totalRealHrs, 0) * 10) / 10;
    });

    return {
      tooltip: { trigger: "axis" as const, axisPointer: { type: "shadow" as const } },
      legend: { data: ["Estimated Hours", "Real Hours"], top: 0, textStyle: { fontSize: 11 } },
      grid: { left: "3%", right: "4%", bottom: "8%", top: "36px", containLabel: true },
      xAxis: {
        type: "category" as const,
        data: projectNames,
        axisLabel: { rotate: projectNames.length > 4 ? 25 : 0, fontSize: 11 },
      },
      yAxis: { type: "value" as const },
      series: [
        {
          name: "Estimated Hours",
          type: "bar" as const,
          data: estimatedData,
          itemStyle: { color: "#2563eb" },
        },
        {
          name: "Real Hours",
          type: "bar" as const,
          data: realData,
          itemStyle: { color: "#d97706" },
        },
      ],
    };
  }, [selectedIds, kpisByProject, nameMap]);

  // ── Chart 3: Resource Workload (Horizontal Bar — completed tasks per dev) ─
  const workloadOption = useMemo(() => {
    // Merge developers across selected projects, summing completed tasks
    const devMap: Record<string, { nombre: string; completadas: number }> = {};

    for (const pid of selectedIds) {
      const devs = devPerfByProject[pid] ?? [];
      for (const dev of devs) {
        if (!devMap[dev.userId]) {
          devMap[dev.userId] = { nombre: dev.nombre, completadas: 0 };
        }
        devMap[dev.userId].completadas += dev.rendimientoGlobal.completadas;
      }
    }

    const entries = Object.values(devMap).sort(
      (a, b) => a.completadas - b.completadas
    );
    const devNames = entries.map((e) => e.nombre);
    const devValues = entries.map((e) => e.completadas);

    return {
      tooltip: {
        formatter: (p: { name: string; value: number }) =>
          `${p.name}: ${p.value} tasks completed`,
      },
      grid: { left: "0%", right: "12%", bottom: "0%", top: "0%", containLabel: true },
      xAxis: { type: "value" as const, name: "Completed Tasks" },
      yAxis: {
        type: "category" as const,
        data: devNames,
        axisLabel: { width: 100, overflow: "truncate" as const },
      },
      series: [
        {
          type: "bar" as const,
          data: devValues.map((v, i) => ({
            value: v,
            itemStyle: { color: PROJECT_COLORS[i % PROJECT_COLORS.length] },
          })),
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: "right" as const, formatter: "{c}" },
        },
      ],
    };
  }, [selectedIds, devPerfByProject]);

  // ── Render ──────────────────────────────────────────────────────

  if (loadingProjects) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <CircularProgress />
      </div>
    );
  }

  if (allProjects.length === 0) {
    return (
      <p style={{ color: "var(--text-3)", fontSize: "0.875rem", marginTop: 16 }}>
        No managed projects found for this account.
      </p>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Project multi-select + Select all / Unselect all */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <span className="section-label" style={{ margin: 0 }}>
          Projects
        </span>
        <FormControl size="small" style={{ minWidth: 320, maxWidth: 520 }}>
          <Select
            multiple
            value={selectedIds}
            onChange={handleChange}
            renderValue={(sel) =>
              sel.length === allProjects.length
                ? "All projects"
                : sel.map((id) => nameMap[id] ?? id).join(", ")
            }
          >
            {allProjects.map((p) => (
              <MenuItem key={p.projectId} value={p.projectId}>
                <Checkbox checked={selectedIds.includes(p.projectId)} size="small" />
                <ListItemText primary={p.nombre} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          size="small"
          variant="outlined"
          onClick={selectedIds.length === allProjects.length ? unselectAll : selectAll}
          style={{ textTransform: "none", fontSize: "0.75rem" }}
        >
          {selectedIds.length === allProjects.length ? "Unselect all" : "Select all"}
        </Button>
      </div>

      {selectedIds.length === 0 && (
        <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>
          Select at least one project to view the portfolio dashboard.
        </p>
      )}

      {selectedIds.length > 0 && (
        <>
          {/* KPI cards */}
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
              <CircularProgress size={28} />
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <KpiCard
                  label="Avg General Progress"
                  value={`${kpiAgg.avgProgress}%`}
                  color="#2563eb"
                />
                <KpiCard
                  label="Avg Sprint Completion"
                  value={`${kpiAgg.avgSprintCompletion}%`}
                  color="#16a34a"
                />
                <KpiCard
                  label="Avg On-Time Delivery"
                  value={`${kpiAgg.avgOnTime}%`}
                  color="#d97706"
                />
                <KpiCard
                  label="Avg Estimation Precision"
                  value={String(kpiAgg.avgEstimationPrecision)}
                  color="#7c3aed"
                />
                <KpiCard
                  label="Total Active Tasks"
                  value={String(kpiAgg.totalActiveTasks)}
                  color="#dc2626"
                />
              </div>

              {/* Charts row 1: Delivery Health + Estimation vs Real */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <ChartCard title="Delivery Health">
                  <ReactECharts option={deliveryHealthOption} style={{ height: 220 }} />
                </ChartCard>
                <ChartCard title="Estimation vs Real (hrs)">
                  <ReactECharts option={estimationOption} style={{ height: 220 }} />
                </ChartCard>
              </div>

              {/* Charts row 2: Resource Workload */}
              <ChartCard title="Resource Workload / Productivity">
                {Object.keys(devPerfByProject).length > 0 ? (
                  <ReactECharts
                    option={workloadOption}
                    style={{
                      height: Math.max(
                        180,
                        Object.values(
                          selectedIds.reduce<Record<string, boolean>>((acc, pid) => {
                            (devPerfByProject[pid] ?? []).forEach(
                              (d) => (acc[d.userId] = true)
                            );
                            return acc;
                          }, {})
                        ).length * 36
                      ),
                    }}
                  />
                ) : (
                  <EmptyState />
                )}
              </ChartCard>
            </>
          )}
        </>
      )}
    </div>
  );
};

// ── Helper sub-components ─────────────────────────────────────────────────────

const KpiCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-md)",
      borderTop: `3px solid ${color}`,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      boxShadow: "var(--shadow-sm)",
    }}
  >
    <span
      style={{
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-3)",
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: "1.5rem", fontWeight: 800, color, lineHeight: 1.1 }}>
      {value}
    </span>
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-md)",
      padding: "16px",
      boxShadow: "var(--shadow-sm)",
    }}
  >
    <h3 style={{ fontSize: "0.78rem", marginBottom: 12 }}>{title}</h3>
    {children}
  </div>
);

const EmptyState = () => (
  <div
    style={{
      height: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-3)",
      fontSize: "0.82rem",
    }}
  >
    No data available
  </div>
);
