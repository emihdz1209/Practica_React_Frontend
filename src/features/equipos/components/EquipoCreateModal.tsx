import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { AppModal } from "@/shared/components/AppModal";
import type { User } from "@/features/users/types/user";
import styles from "../pages/EquiposPage.module.css";

export interface EquipoCreateFormState {
  nombre: string;
  descripcion: string;
  ownerId: string;
}

interface EquipoCreateModalProps {
  open: boolean;
  users: User[];
  form: EquipoCreateFormState;
  onClose: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOwnerChange: (ownerId: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  isPending: boolean;
}

export const EquipoCreateModal = ({
  open,
  users,
  form,
  onClose,
  onChange,
  onOwnerChange,
  onSubmit,
  isPending,
}: EquipoCreateModalProps) => {
  return (
    <AppModal open={open} onClose={onClose} title="Crear equipo">
      <form onSubmit={onSubmit} className={styles.modalForm}>
        <TextField
          name="nombre"
          label="Nombre"
          value={form.nombre}
          onChange={onChange}
          required
          size="small"
          fullWidth
        />

        <TextField
          name="descripcion"
          label="Descripción"
          value={form.descripcion}
          onChange={onChange}
          multiline
          minRows={4}
          size="small"
          fullWidth
        />

        <FormControl size="small" required fullWidth>
          <InputLabel>Owner</InputLabel>
          <Select
            value={form.ownerId}
            label="Owner"
            onChange={(event) => onOwnerChange(event.target.value as string)}
          >
            {users.map((user) => (
              <MenuItem key={user.userId} value={user.userId}>
                {user.primerNombre} {user.apellido}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" className="AddButton" disabled={isPending} fullWidth>
          {isPending ? <CircularProgress size={18} /> : "Crear equipo"}
        </Button>
      </form>
    </AppModal>
  );
};
