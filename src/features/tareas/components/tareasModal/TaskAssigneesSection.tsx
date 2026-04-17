import {
  CircularProgress,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TaskAssigneesSectionProps } from "@/features/tareas/components/tareasModal/types";

export const TaskAssigneesSection = ({
  availableUsers,
  selectedUserId,
  assignError,
  assigneesLoading,
  assigneesError,
  usersLoading,
  isAssigning,
  isRemoving,
  removingUserId,
  assignedUsers,
  onAssignUser,
  onSelectUser,
  onRemoveUser,
}: TaskAssigneesSectionProps) => {
  return (
    <div className="task-detail-section">
      <span className="task-detail-label">Usuarios asignados</span>

      <div className="task-assignee-toolbar">
        <FormControl size="small" fullWidth>
          <InputLabel>Asignar usuario</InputLabel>
          <Select
            label="Asignar usuario"
            value={selectedUserId}
            disabled={usersLoading || availableUsers.length === 0 || isAssigning}
            onChange={(event) => onSelectUser(event.target.value as string)}
          >
            {availableUsers.length === 0 ? (
              <MenuItem value="" disabled>
                No hay usuarios disponibles
              </MenuItem>
            ) : (
              availableUsers.map((user) => (
                <MenuItem key={user.userId} value={user.userId}>
                  {user.primerNombre} {user.apellido}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <Button
          type="button"
          className="AddButton"
          disabled={!selectedUserId || isAssigning}
          onClick={onAssignUser}
        >
          {isAssigning ? <CircularProgress size={18} /> : "Asignar"}
        </Button>
      </div>

      {assignError && <p className="task-form-feedback task-form-feedback--error">{assignError}</p>}

      {assigneesLoading ? (
        <div className="task-assignees-loading">
          <CircularProgress size={22} />
        </div>
      ) : assigneesError ? (
        <p className="task-detail-feedback">No se pudieron cargar los usuarios asignados.</p>
      ) : assignedUsers.length === 0 ? (
        <p className="task-detail-empty">Esta tarea no tiene usuarios asignados.</p>
      ) : (
        <ul className="task-assignee-list">
          {assignedUsers.map((assigned) => (
            <li key={assigned.userId} className="task-assignee-item">
              <span className="task-detail-value">{assigned.nombre || assigned.userId}</span>
              <button
                type="button"
                className="task-assignee-remove-btn"
                title="Remover usuario"
                aria-label={`Remover ${assigned.nombre || assigned.userId}`}
                disabled={isRemoving && removingUserId === assigned.userId}
                onClick={() => onRemoveUser(assigned.userId)}
              >
                <DeleteIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
