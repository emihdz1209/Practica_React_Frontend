export interface Tarea {
  taskId: string;
  titulo: string;
  descripcion: string;
  estadoId: number;
  fechaCreacion: string;
  fechaLimite: string | null;
  fechaFinalizacion: string | null;
  prioridadId: number;
  projectId: string;
  sprintId: string | null;
  tiempoEstimado: number;
  tiempoReal: number;
}

export interface CreateTareaRequest {
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  prioridadId: number;
  sprintId?: string;
  tiempoEstimado?: number;
}

export interface UpdateTareaRequest {
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  prioridadId: number;
  sprintId?: string;
  tiempoEstimado?: number;
}
