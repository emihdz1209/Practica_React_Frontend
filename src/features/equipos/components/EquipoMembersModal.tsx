import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { AppModal } from "@/shared/components/AppModal";
import type { User } from "@/features/users/types/user";
import styles from "../pages/EquipoDetailPage.module.css";

interface EquipoMembersModalProps {
  open: boolean;
  users: User[];
  selectedUserId: string;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const EquipoMembersModal = ({
  open,
  users,
  selectedUserId,
  onClose,
  onSelectUser,
  onSubmit,
  isPending,
}: EquipoMembersModalProps) => {
  return (
    <AppModal open={open} onClose={onClose} title="Añadir miembro">
      <div className={styles.modalForm}>
        <FormControl size="small" fullWidth>
          <InputLabel>Usuario</InputLabel>
          <Select
            value={selectedUserId}
            label="Usuario"
            onChange={(event) => onSelectUser(event.target.value as string)}
          >
            <MenuItem value="">Selecciona un usuario</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.userId} value={user.userId}>
                {user.primerNombre} {user.apellido}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={onSubmit} disabled={!selectedUserId || isPending} fullWidth className="AddButton">
          {isPending ? <CircularProgress size={18} /> : "Añadir"}
        </Button>
      </div>
    </AppModal>
  );
};
