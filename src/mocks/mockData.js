// In-memory store — all mutations operate on these arrays
let users = [
  { userId: 1, primerNombre: 'Ana', apellido: 'García', email: 'ana.garcia@example.com', telefono: '555-0101', telegramId: '@anagarcia' },
  { userId: 2, primerNombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@example.com', telefono: '555-0102', telegramId: '@carloslopez' },
  { userId: 3, primerNombre: 'Sofía', apellido: 'Martínez', email: 'sofia.martinez@example.com', telefono: '555-0103', telegramId: '@sofiamtz' },
  { userId: 4, primerNombre: 'Diego', apellido: 'Hernández', email: 'diego.hernandez@example.com', telefono: '555-0104', telegramId: '@diegoh' },
];

let equipos = [
  { teamId: 1, nombre: 'Equipo Backend', descripcion: 'Desarrolladores de servicios y APIs', userId: 1 },
  { teamId: 2, nombre: 'Equipo Frontend', descripcion: 'Desarrolladores de interfaces de usuario', userId: 2 },
  { teamId: 3, nombre: 'Equipo QA', descripcion: 'Control de calidad y pruebas', userId: 3 },
];

let proyectos = [
  { projectId: 1, nombre: 'Portal de Clientes', descripcion: 'Rediseño del portal web para clientes', fechaInicio: '2026-01-15T00:00:00', fechaFin: '2026-06-30T00:00:00', progreso: 45, teamId: 2 },
  { projectId: 2, nombre: 'API de Pagos', descripcion: 'Integración con pasarela de pagos externa', fechaInicio: '2026-02-01T00:00:00', fechaFin: '2026-05-15T00:00:00', progreso: 70, teamId: 1 },
  { projectId: 3, nombre: 'Suite de Automatización', descripcion: 'Automatización de pruebas de regresión', fechaInicio: '2026-03-01T00:00:00', fechaFin: '2026-07-31T00:00:00', progreso: 20, teamId: 3 },
];

let tareas = [
  { taskId: 1, titulo: 'Diseñar mockups de pantalla principal', descripcion: 'Crear mockups en Figma para la página de inicio del portal', fechaLimite: '2026-04-20T00:00:00', tiempoEstimado: 8, tiempoReal: null, estadoId: 2, prioridadId: 1, proyectId: 1 },
  { taskId: 2, titulo: 'Implementar componente de autenticación', descripcion: 'Login y registro con validaciones', fechaLimite: '2026-04-25T00:00:00', tiempoEstimado: 12, tiempoReal: null, estadoId: 1, prioridadId: 1, proyectId: 1 },
  { taskId: 3, titulo: 'Conectar endpoint de checkout', descripcion: 'Integrar el formulario de pago con la API', fechaLimite: '2026-04-30T00:00:00', tiempoEstimado: 6, tiempoReal: null, estadoId: 2, prioridadId: 2, proyectId: 2 },
  { taskId: 4, titulo: 'Validar webhooks de Stripe', descripcion: 'Probar confirmaciones de pago y eventos de fallo', fechaLimite: '2026-05-05T00:00:00', tiempoEstimado: 4, tiempoReal: null, estadoId: 1, prioridadId: 2, proyectId: 2 },
  { taskId: 5, titulo: 'Configurar pipeline de CI/CD', descripcion: 'Configurar GitHub Actions para pruebas automáticas', fechaLimite: '2026-04-18T00:00:00', tiempoEstimado: 5, tiempoReal: 6, estadoId: 3, prioridadId: 1, proyectId: 3 },
  { taskId: 6, titulo: 'Escribir pruebas de integración para API', descripcion: 'Cobertura de endpoints críticos con Jest', fechaLimite: '2026-05-10T00:00:00', tiempoEstimado: 10, tiempoReal: null, estadoId: 1, prioridadId: 2, proyectId: 3 },
  { taskId: 7, titulo: 'Optimizar consultas de base de datos', descripcion: 'Revisar y optimizar queries lentas en producción', fechaLimite: '2026-04-22T00:00:00', tiempoEstimado: 8, tiempoReal: null, estadoId: 2, prioridadId: 1, proyectId: 2 },
  { taskId: 8, titulo: 'Documentar API REST', descripcion: 'Generar documentación con Swagger/OpenAPI', fechaLimite: '2026-05-20T00:00:00', tiempoEstimado: 6, tiempoReal: 7, estadoId: 3, prioridadId: 3, proyectId: 2 },
  { taskId: 9, titulo: 'Revisar accesibilidad del portal', descripcion: 'Auditoría WCAG 2.1 de componentes principales', fechaLimite: '2026-05-15T00:00:00', tiempoEstimado: 4, tiempoReal: null, estadoId: 1, prioridadId: 3, proyectId: 1 },
  { taskId: 10, titulo: 'Migrar estilos a sistema de diseño', descripcion: 'Unificar tokens de diseño en todos los componentes', fechaLimite: '2026-05-30T00:00:00', tiempoEstimado: 14, tiempoReal: null, estadoId: 1, prioridadId: 2, proyectId: 1 },
];

let nextIds = { userId: 5, teamId: 4, projectId: 4, taskId: 11 };

// Helper — simulate network latency
const delay = (ms = 120) => new Promise(res => setTimeout(res, ms));

const ok = (data) => ({ data });

export const mockHandlers = {
  // ── USERS ──────────────────────────────────────────────────────────────────
  'GET /users': async () => { await delay(); return ok([...users]); },
  'POST /users': async (body) => {
    await delay();
    const user = { ...body, userId: nextIds.userId++ };
    users.push(user);
    return ok(user);
  },

  // ── EQUIPOS ────────────────────────────────────────────────────────────────
  'GET /equipos': async () => { await delay(); return ok([...equipos]); },
  'POST /equipos': async (body) => {
    await delay();
    const equipo = { ...body, teamId: nextIds.teamId++ };
    equipos.push(equipo);
    return ok(equipo);
  },

  // ── PROYECTOS ──────────────────────────────────────────────────────────────
  'GET /proyectos': async () => { await delay(); return ok([...proyectos]); },
  'POST /proyectos': async (body) => {
    await delay();
    const proyecto = { ...body, projectId: nextIds.projectId++ };
    proyectos.push(proyecto);
    return ok(proyecto);
  },

  // ── TAREAS ─────────────────────────────────────────────────────────────────
  'GET /tareas': async () => { await delay(); return ok([...tareas]); },
  'GET /tareas/proyecto/:id': async (id) => {
    await delay();
    return ok(tareas.filter(t => t.proyectId === Number(id)));
  },
  'POST /tareas': async (body) => {
    await delay();
    const tarea = { ...body, taskId: nextIds.taskId++ };
    tareas.push(tarea);
    return ok(tarea);
  },
  'PUT /tareas/:id': async (id, body) => {
    await delay();
    const idx = tareas.findIndex(t => t.taskId === Number(id));
    if (idx === -1) throw new Error('Not found');
    tareas[idx] = { ...tareas[idx], ...body };
    return ok(tareas[idx]);
  },
  'DELETE /tareas/:id': async (id) => {
    await delay();
    tareas = tareas.filter(t => t.taskId !== Number(id));
    return ok(null);
  },
};
