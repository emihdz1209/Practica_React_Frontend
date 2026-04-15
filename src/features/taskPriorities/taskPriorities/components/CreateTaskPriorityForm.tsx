import { useState } from "react"
import { useCreateTaskPriority } from "../hooks/useTaskPriorities"
import styles from "./CreateTaskPriorityForm.module.css"

export const CreateTaskPriorityForm = () => {
  const { mutate, isPending } = useCreateTaskPriority();

  const [form, setForm] = useState({
    nombre: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutate({
      nombre: form.nombre,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Crear Prioridad</h2>

      <input
        className={styles.input}
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
      />

      <button className={styles.button} disabled={isPending}>
        Crear Prioridad
      </button>
    </form>
  );
};