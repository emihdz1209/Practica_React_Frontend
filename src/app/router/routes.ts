/// src/app/router/routes.ts

export const ROUTES = {
  login:      "/login",
  dashboard:  "/",
  agent:      "/agent",
  agentBacklog: "/agent/backlog",
  agentDuplicateAnalysis: "/agent/duplicate-analysis",
  priorities: "/priorities",
  tareas:     "/tareas",
  proyectos:  "/proyectos",
  proyectoDashboard: "/proyectos/:projectId",
  equipos:    "/equipos",
  managerDashboard: "/manager-dashboard",
} as const;
