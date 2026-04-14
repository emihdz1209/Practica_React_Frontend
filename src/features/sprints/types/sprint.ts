export interface Sprint {
  sprintId: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  projectId: string;
}

export interface CreateSprintRequest {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface UpdateSprintRequest {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}
