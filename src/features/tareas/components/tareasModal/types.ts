import type { Sprint } from "@/features/proyectos/types/proyecto";
import type { Tarea } from "@/features/tareas/types/tarea";
import type { User } from "@/features/users/types/user";

export interface TaskEditFormState {
  titulo: string;
  descripcion: string;
  fechaLimite: string;
  prioridadId: string;
  estadoId: string;
  sprintId: string;
  tiempoEstimado: string;
  tiempoReal: string;
}

export const EMPTY_FORM: TaskEditFormState = {
  titulo: "",
  descripcion: "",
  fechaLimite: "",
  prioridadId: "",
  estadoId: "",
  sprintId: "",
  tiempoEstimado: "",
  tiempoReal: "",
};

export interface TaskPriorityOption {
  prioridadId: number;
  nombre: string;
}

export interface TaskStatusOption {
  id: number;
  nombre: string;
}

export interface AssignedUserOption {
  userId: string;
  normalizedUserId: string;
  nombre: string;
}

export interface TareaEditFormSectionProps {
  form: TaskEditFormState;
  projectId?: string;
  sprints: Sprint[];
  sprintsLoading: boolean;
  prioritiesLoading: boolean;
  statusesLoading: boolean;
  taskPriorities: TaskPriorityOption[];
  statusOptions: TaskStatusOption[];
  saveError: string | null;
  saveFeedback: string | null;
  isSaving: boolean;
  fechaCreacion: Tarea["fechaCreacion"];
  fechaFinalizacion: Tarea["fechaFinalizacion"];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: keyof TaskEditFormState, value: string) => void;
}

export interface TaskAssigneesSectionProps {
  availableUsers: User[];
  selectedUserId: string;
  assignError: string | null;
  assigneesLoading: boolean;
  assigneesError: boolean;
  usersLoading: boolean;
  isAssigning: boolean;
  isRemoving: boolean;
  removingUserId: string | null;
  assignedUsers: AssignedUserOption[];
  onAssignUser: () => void;
  onSelectUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
}
