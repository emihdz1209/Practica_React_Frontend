/// src/features/proyectos/components/ProjectDashboard.tsx

import { useState } from "react";
import type { ReactNode } from "react";
import { CircularProgress, FormControl, MenuItem, Select } from "@mui/material";
import ReactECharts from "echarts-for-react";
import {
    useProjectSprints,
    useAllSprintKpis,
    useProjectProgress,
    useDeveloperPerformance,
} from "@/features/proyectos/hooks/useProyectos";

interface Props {
    projectId: string;
}

export const ProjectDashboard = ({ projectId }: Props) => {
    const [selectedSprintId, setSelectedSprintId] = useState<string>("");

    const { data: sprints = [], isLoading: loadingSprints } = useProjectSprints(projectId);
    const { data: progressData } = useProjectProgress(projectId);
    const { data: devPerf = [], isLoading: loadingDevs } = useDeveloperPerformance(projectId);
    const sprintKpisQueries = useAllSprintKpis(sprints);

    const effectiveSprintId = selectedSprintId || sprints[0]?.sprintId || "";
    const selectedSprintIdx = sprints.findIndex((s) => s.sprintId === effectiveSprintId);
    const selectedKpis = selectedSprintIdx >= 0 ? sprintKpisQueries[selectedSprintIdx]?.data : undefined;

    // ── Derived KPI values ──────────────────────────────────────────
    const progressValue = progressData?.progress ?? 0;

    const completionRate =
        selectedKpis && selectedKpis.totalTareas > 0
        ? Math.round((selectedKpis.tareasCompletadas / selectedKpis.totalTareas) * 100)
        : null;

    const onTimeRate =
        selectedKpis && selectedKpis.tareasCompletadas > 0
        ? Math.round((selectedKpis.aTiempo / selectedKpis.tareasCompletadas) * 100)
        : null;

    const estimationAccuracy =
        selectedKpis && selectedKpis.totalRealHrs > 0
        ? (selectedKpis.totalEstimadoHrs / selectedKpis.totalRealHrs).toFixed(2)
        : null;

    // ── Chart: Gauge — Progreso General ─────────────────────────────
    const gaugeOption = {
        series: [
        {
            type: "gauge",
            min: 0,
            max: 100,
            splitNumber: 4,
            axisLine: {
            lineStyle: {
                width: 18,
                color: [
                [progressValue / 100, "#2563eb"],
                [1, "#e4e4e7"],
                ],
            },
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            pointer: { show: false },
            detail: {
            valueAnimation: true,
            formatter: "{value}%",
            fontSize: 22,
            fontWeight: "bold",
            color: "#2563eb",
            offsetCenter: [0, "10%"],
            },
            title: { show: false },
            data: [{ value: Math.round(progressValue) }],
        },
        ],
    };

    // ── Chart: Donut — Sprint Completion Rate ────────────────────────
    const donutOption = selectedKpis
        ? {
            color: ["#16a34a", "#e4e4e7"],
            series: [
            {
                type: "pie",
                radius: ["55%", "75%"],
                avoidLabelOverlap: false,
                label: {
                show: true,
                position: "center",
                formatter: `${completionRate ?? 0}%`,
                fontSize: 22,
                fontWeight: "bold",
                color: "#16a34a",
                },
                emphasis: { disabled: true },
                data: [
                { value: selectedKpis.tareasCompletadas, name: "Completadas" },
                {
                    value: Math.max(0, selectedKpis.totalTareas - selectedKpis.tareasCompletadas),
                    name: "Pendientes",
                },
                ],
            },
            ],
        }
        : null;

    // ── Chart: Horizontal Bar — Responsabilidad Individual ──────────
    const devNames = devPerf.map((d) => d.nombre);
    const devRates = devPerf.map((d) =>
        Math.round(d.rendimientoGlobal.porcentajeCompletadas * 10) / 10
    );
    const hbarOption = {
        tooltip: { formatter: (p: { name: string; value: number }) => `${p.name}: ${p.value}%` },
        grid: { left: "0%", right: "12%", bottom: "0%", top: "0%", containLabel: true },
        xAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } },
        yAxis: { type: "category", data: devNames, axisLabel: { width: 80, overflow: "truncate" } },
        series: [
        {
            type: "bar",
            data: devRates,
            itemStyle: { color: "#7c3aed", borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: "right", formatter: "{c}%" },
        },
        ],
    };

    // ── Chart: Stacked Bar — Entrega a Tiempo ───────────────────────
    const sprintNames = sprints.map((s) => s.nombre);
    const aTiempoData = sprintKpisQueries.map((q) => q.data?.aTiempo ?? 0);
    const conRetrasoData = sprintKpisQueries.map((q) => q.data?.conRetraso ?? 0);
    const stackedBarOption = {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        legend: { data: ["A tiempo", "Con retraso"], top: 0, textStyle: { fontSize: 11 } },
        grid: { left: "3%", right: "4%", bottom: "8%", top: "36px", containLabel: true },
        xAxis: { type: "category", data: sprintNames },
        yAxis: { type: "value" },
        series: [
        {
            name: "A tiempo",
            type: "bar",
            stack: "total",
            data: aTiempoData,
            itemStyle: { color: "#16a34a" },
        },
        {
            name: "Con retraso",
            type: "bar",
            stack: "total",
            data: conRetrasoData,
            itemStyle: { color: "#dc2626" },
        },
        ],
    };

    // ── Chart: Grouped Bar — Estimación vs Real ──────────────────────
    const estimadoData = sprintKpisQueries.map((q) => q.data?.totalEstimadoHrs ?? 0);
    const realData = sprintKpisQueries.map((q) => q.data?.totalRealHrs ?? 0);
    const groupedBarOption = {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        legend: { data: ["Estimado (hrs)", "Real (hrs)"], top: 0, textStyle: { fontSize: 11 } },
        grid: { left: "3%", right: "4%", bottom: "8%", top: "36px", containLabel: true },
        xAxis: { type: "category", data: sprintNames },
        yAxis: { type: "value" },
        series: [
        {
            name: "Estimado (hrs)",
            type: "bar",
            data: estimadoData,
            itemStyle: { color: "#2563eb" },
        },
        {
            name: "Real (hrs)",
            type: "bar",
            data: realData,
            itemStyle: { color: "#d97706" },
        },
        ],
    };

    // ── Chart: Multi-line — Productividad Histórica ──────────────────
    // Collect all sprint names in order from devPerf
    const allSprintNames = Array.from(
        new Map(
        devPerf
            .flatMap((d) => d.historicoSprints)
            .map((s) => [s.sprintId, s.sprintNombre])
        ).values()
    );
    const multilineOption = {
        tooltip: { trigger: "axis" },
        legend: { data: devNames, top: 0, textStyle: { fontSize: 11 } },
        grid: { left: "3%", right: "4%", bottom: "8%", top: "36px", containLabel: true },
        xAxis: { type: "category", data: allSprintNames, boundaryGap: false },
        yAxis: { type: "value", name: "Tareas", nameTextStyle: { fontSize: 11 } },
        series: devPerf.map((dev) => ({
        name: dev.nombre,
        type: "line",
        smooth: true,
        data: allSprintNames.map(
            (sName) =>
            dev.historicoSprints.find((s) => s.sprintNombre === sName)?.tareasTerminadas ?? 0
        ),
        })),
    };

    // ── Chart: Heatmap — Carga de Trabajo ───────────────────────────
    const heatmapData = devPerf.flatMap((dev, devIdx) =>
        dev.historicoSprints.map((s) => {
        const sprintIdx = allSprintNames.indexOf(s.sprintNombre);
        return [sprintIdx, devIdx, s.horasReales];
        })
    );
    const maxHours = Math.max(...heatmapData.map((d) => d[2] as number), 1);
    const heatmapOption = {
        tooltip: {
        formatter: (p: { data: number[] }) =>
            `${devNames[p.data[1]]}<br/>${allSprintNames[p.data[0]]}: <b>${p.data[2]} hrs</b>`,
        },
        grid: { left: "0%", right: "5%", bottom: "20%", top: "5%", containLabel: true },
        xAxis: { type: "category", data: allSprintNames, splitArea: { show: true } },
        yAxis: { type: "category", data: devNames, splitArea: { show: true } },
        visualMap: {
        min: 0,
        max: maxHours,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: { color: ["#eff6ff", "#2563eb"] },
        textStyle: { fontSize: 10 },
        },
        series: [
        {
            type: "heatmap",
            data: heatmapData,
            label: { show: true, formatter: (p: { data: number[] }) => `${p.data[2]}h` },
            emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)" } },
        },
        ],
    };

    // ── Render ───────────────────────────────────────────────────────
    if (loadingSprints || loadingDevs) {
        return (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <CircularProgress />
        </div>
        );
    }

    return (
        <div style={{ width: "100%" }}>
        {/* Sprint selector */}
        {sprints.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span className="section-label" style={{ margin: 0 }}>
                Sprint activo
            </span>
            <FormControl size="small" style={{ minWidth: 180 }}>
                <Select
                value={effectiveSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                >
                {sprints.map((s) => (
                    <MenuItem key={s.sprintId} value={s.sprintId}>
                    {s.nombre}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </div>
        )}

        {sprints.length === 0 && (
            <p style={{ color: "var(--text-3)", fontSize: "0.875rem", marginBottom: 16 }}>
            Este proyecto aún no tiene sprints. Crea uno para ver KPIs de sprint.
            </p>
        )}

        {/* KPI summary cards */}
        <div
            style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
            marginBottom: 24,
            }}
        >
            <KpiCard label="Progreso General" value={`${Math.round(progressValue)}%`} color="#2563eb" />
            <KpiCard
            label="Sprint Completion"
            value={completionRate !== null ? `${completionRate}%` : "—"}
            color="#16a34a"
            />
            <KpiCard
            label="Entrega a Tiempo"
            value={onTimeRate !== null ? `${onTimeRate}%` : "—"}
            color="#d97706"
            />
            <KpiCard
            label="Precisión Estimación"
            value={estimationAccuracy !== null ? String(estimationAccuracy) : "—"}
            color="#7c3aed"
            />
            <KpiCard
            label="Tareas en Sprint"
            value={selectedKpis ? String(selectedKpis.totalTareas) : "—"}
            color="#dc2626"
            />
        </div>

        {/* Row 1: Gauge + Donut + Horizontal Bar */}
        <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}
        >
            <ChartCard title="Progreso General">
            <ReactECharts option={gaugeOption} style={{ height: 240 }} />
            </ChartCard>

            <ChartCard title="Sprint Completion Rate">
            {donutOption ? (
                <ReactECharts option={donutOption} style={{ height: 240 }} />
            ) : (
                <EmptyState />
            )}
            </ChartCard>

            <ChartCard title="Responsabilidad Individual">
            {devPerf.length > 0 ? (
                <ReactECharts
                option={hbarOption}
                style={{ height: Math.max(240, devPerf.length * 48) }}
                />
            ) : (
                <EmptyState />
            )}
            </ChartCard>
        </div>

        {/* Row 2: Stacked Bar + Grouped Bar */}
        <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}
        >
            <ChartCard title="Entrega a Tiempo por Sprint">
            {sprints.length > 0 ? (
                <ReactECharts option={stackedBarOption} style={{ height: 280 }} />
            ) : (
                <EmptyState />
            )}
            </ChartCard>

            <ChartCard title="Estimación vs Real (hrs)">
            {sprints.length > 0 ? (
                <ReactECharts option={groupedBarOption} style={{ height: 280 }} />
            ) : (
                <EmptyState />
            )}
            </ChartCard>
        </div>

        {/* Row 3: Multi-line + Heatmap */}
        <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 8 }}
        >
            <ChartCard title="Productividad Histórica por Desarrollador">
            {devPerf.length > 0 && allSprintNames.length > 0 ? (
                <ReactECharts option={multilineOption} style={{ height: 280 }} />
            ) : (
                <EmptyState />
            )}
            </ChartCard>

            <ChartCard title="Carga de Trabajo (hrs por sprint)">
            {heatmapData.length > 0 ? (
                <ReactECharts option={heatmapOption} style={{ height: 280 }} />
            ) : (
                <EmptyState />
            )}
            </ChartCard>
        </div>
        </div>
    );
};

// ── Helper sub-components ────────────────────────────────────────────────────

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
        Sin datos suficientes
    </div>
);