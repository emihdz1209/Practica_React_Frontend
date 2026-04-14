export interface Team {
  teamId: string;
  nombre: string;
  descripcion: string;
  ownerId: string;
}

export interface CreateTeamRequest {
  nombre: string;
  descripcion: string;
  ownerId: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
}
