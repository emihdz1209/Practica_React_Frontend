/// src/features/dashboard/types/dashboard.ts

export interface ManagedProject {
  projectId: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  progreso: number;
  teamId: string;
}
