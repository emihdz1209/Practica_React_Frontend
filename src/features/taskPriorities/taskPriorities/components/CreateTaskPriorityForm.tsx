import { useState } from "react"
import { useCreateTaskPriority } from "../hooks/useTaskPriorities"
import styles from "../../users/components/CreateUserForm.module.css"

export const CreateTaskPriorityForm = () => {
  const { mutate, isPending } = useCreateTaskPriority()

  const [form, setForm] = useState({
    prioridadId: "",
    nombre: "",
    descripcion: "",
    orden: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    mutate({
      prioridadId: Number(form.prioridadId),
      nombre: form.nombre,
      descripcion: form.descripcion,
      orden: Number(form.orden)
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Crear Prioridad</h2>

      <input
        className={styles.input}
        name="prioridadId"
        placeholder="ID prioridad"
        onChange={handleChange}
      />

      <input
        className={styles.input}
        name="nombre"
        placeholder="Nombre"
        onChange={handleChange}
      />

      <input
        className={styles.input}
        name="descripcion"
        placeholder="Descripción"
        onChange={handleChange}
      />

      <input
        className={styles.input}
        name="orden"
        placeholder="Orden"
        onChange={handleChange}
      />

      <button className={styles.button} disabled={isPending}>
        Crear Prioridad
      </button>
    </form>
  )
}