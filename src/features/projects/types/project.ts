export interface Project {
  projectId: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
  teamId: string;
}

export interface CreateProjectRequest {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface UpdateProjectRequest {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface ProjectProgressResponse {
  projectId: string;
  progress: number;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
}
