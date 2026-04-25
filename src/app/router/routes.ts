/// src/app/router/routes.ts

export const ROUTES = {
  login:      "/login",
  dashboard:  "/",
  users:      "/users",
  priorities: "/priorities",
  tareas:     "/tareas",
  proyectos:  "/proyectos",
  proyectoDashboard: "/proyectos/:projectId",
  equipos:    "/equipos",
  managerDashboard: "/manager-dashboard",
} as const;
