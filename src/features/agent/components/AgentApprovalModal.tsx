import type { Dispatch, SetStateAction } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import { AppModal } from "@/shared/components/AppModal";
import type { ApprovalFormState } from "@/features/agent/types/agentBacklogView";
import type { Sprint } from "@/features/proyectos/types/proyecto";
import styles from "@/features/agent/styles/AgentBacklogPage.module.css";

interface PriorityOption {
  prioridadId: number;
  nombre: string;
}

interface AgentApprovalModalProps {
  open: boolean;
  form: ApprovalFormState;
  onFormChange: Dispatch<SetStateAction<ApprovalFormState>>;
  onClose: () => void;
  onSave: () => void;
  approvalError: string | null;
  priorities: PriorityOption[];
  prioritiesLoading: boolean;
  sprints: Sprint[];
  sprintsLoading: boolean;
  minFechaLimite: string;
}

export const AgentApprovalModal = ({
  open,
  form,
  onFormChange,
  onClose,
  onSave,
  approvalError,
  priorities,
  prioritiesLoading,
  sprints,
  sprintsLoading,
  minFechaLimite,
}: AgentApprovalModalProps) => {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Completar datos de aprobacion"
    >
      <div className={styles.approvalModalContent}>
        <form
          className="modal-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <TextField
            name="fechaLimite"
            label="Fecha limite"
            type="datetime-local"
            value={form.fechaLimite}
            onChange={(event) =>
              onFormChange((current) => ({
                ...current,
                fechaLimite: event.target.value,
              }))
            }
            required
            size="small"
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                min: minFechaLimite,
              },
            }}
          />

          <FormControl size="small" required fullWidth>
            <InputLabel>Prioridad</InputLabel>
            <Select
              name="prioridadId"
              value={form.prioridadId}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  prioridadId: event.target.value as string,
                }))
              }
              label="Prioridad"
              disabled={prioritiesLoading}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.prioridadId} value={priority.prioridadId}>
                  {priority.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Sprint (opcional)</InputLabel>
            <Select
              name="sprintId"
              value={form.sprintId}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  sprintId: event.target.value as string,
                }))
              }
              label="Sprint (opcional)"
              disabled={sprintsLoading}
            >
              <MenuItem value="">
                <em>Sin sprint</em>
              </MenuItem>
              {sprints.map((sprint) => (
                <MenuItem key={sprint.sprintId} value={sprint.sprintId}>
                  {sprint.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {approvalError && (
            <p className={styles.formError} role="alert">
              {approvalError}
            </p>
          )}

          <Button
            className="AddButton"
            type="submit"
            fullWidth
            disabled={prioritiesLoading}
          >
            Guardar datos
          </Button>
        </form>
      </div>
    </AppModal>
  );
};
