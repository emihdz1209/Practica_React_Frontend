export interface Proyecto {
  projectId: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  progreso: number;
  teamId: string;
}

export interface CreateProyectoRequest {
  nombre: string;
  descripcion: string;
  fechaInicio: string | null;
  fechaFin: string | null;
}

export interface Sprint {
  sprintId: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  projectId: string;
}

export interface SprintKpis {
  totalTareas: number;
  tareasCompletadas: number;
  aTiempo: number;
  conRetraso: number;
  totalEstimadoHrs: number;
  totalRealHrs: number;
}

export interface DeveloperPerformance {
  userId: string;
  nombre: string;
  rendimientoGlobal: {
    asignadas: number;
    completadas: number;
    porcentajeCompletadas: number;
  };
  historicoSprints: {
    sprintId: string;
    sprintNombre: string;
    tareasTerminadas: number;
    horasReales: number;
  }[];
}

export interface ProjectProgress {
  projectId: string;
  progress: number;
}