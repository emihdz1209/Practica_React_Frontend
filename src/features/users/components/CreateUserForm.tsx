import { useState } from "react";
import { TextField, Button, CircularProgress } from "@mui/material";
import { useCreateUser } from "@/features/users/hooks/useUsers";

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const { mutate, isPending } = useCreateUser();

  const [formData, setFormData] = useState({
    primerNombre: "",
    apellido: "",
    telefono: "",
    email: "",
    telegramId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData, {
      onSuccess: () => {
        setFormData({
          primerNombre: "",
          apellido: "",
          telefono: "",
          email: "",
          telegramId: "",
        });
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="modal-form-row">
        <TextField
          name="primerNombre"
          label="Nombre"
          value={formData.primerNombre}
          onChange={handleChange}
          required
          size="small"
        />
        <TextField
          name="apellido"
          label="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
          size="small"
        />
      </div>

      <TextField
        name="email"
        label="Correo electrónico"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        size="small"
        fullWidth
      />

      <div className="modal-form-row">
        <TextField
          name="telefono"
          label="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          size="small"
        />
        <TextField
          name="telegramId"
          label="Telegram ID"
          value={formData.telegramId}
          onChange={handleChange}
          required
          size="small"
        />
      </div>

      <Button
        type="submit"
        variant="contained"
        className="AddButton"
        disabled={isPending}
        fullWidth
      >
        {isPending ? <CircularProgress size={18} /> : "Crear usuario"}
      </Button>
    </form>
  );
};