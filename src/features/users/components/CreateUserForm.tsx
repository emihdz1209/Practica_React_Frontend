import { useState } from "react";
import { useCreateUser } from "@/features/users/hooks/useUsers";

import styles from "./CreateUserForm.module.css";

export const CreateUserForm = () => {
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

    mutate(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Crear Usuario</h2>

      <input
        className={styles.input}
        name="primerNombre"
        placeholder="Primer Nombre"
        value={formData.primerNombre}
        onChange={handleChange}
      />

      <input
        className={styles.input}
        name="apellido"
        placeholder="Apellido"
        value={formData.apellido}
        onChange={handleChange}
      />

      <input
        className={styles.input}
        name="telefono"
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={handleChange}
      />

      <input
        className={styles.input}
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />

      <input
        className={styles.input}
        name="telegramId"
        placeholder="Telegram ID"
        value={formData.telegramId}
        onChange={handleChange}
      />

      <button className={styles.button} type="submit" disabled={isPending}>
        {isPending ? "Creando..." : "Crear Usuario"}
      </button>
    </form>
  );
};