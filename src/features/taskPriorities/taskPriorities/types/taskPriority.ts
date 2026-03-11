export interface TaskPriority {
  prioridadId: number
  nombre: string
  descripcion?: string
  orden: number
}

export interface CreateTaskPriorityRequest {
  prioridadId: number
  nombre: string
  descripcion?: string
  orden: number
}