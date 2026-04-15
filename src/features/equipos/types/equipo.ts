export interface Equipo {
  teamId: string;
  nombre: string;
  descripcion: string;
  ownerId: string;
}

export interface CreateEquipoRequest {
  nombre: string;
  descripcion: string;
  ownerId: string;
}
