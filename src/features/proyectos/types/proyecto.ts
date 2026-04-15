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
