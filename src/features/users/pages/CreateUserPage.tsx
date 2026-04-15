import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useUsers } from "@/features/users/hooks/useUsers";
import { CreateUserForm } from "@/features/users/components/CreateUserForm";
import { AppModal } from "@/shared/components/AppModal";
import { NavBar } from "@/shared/pages/NavBar";

export const CreateUserPage = () => {
  const { data: users, isLoading } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="App">
      <NavBar />
      <div className="page-header">
        <div>
          <h2>Usuarios</h2>
          <p className="page-subtitle">Gestión de usuarios del sistema</p>
        </div>
        <Button
          className="AddButton"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Nuevo usuario
        </Button>
      </div>

      <div style={{ width: "100%" }}>
        <span className="section-label">
          Usuarios registrados · {(users || []).length}
        </span>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Telegram ID</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((user) => (
                <tr key={user.email}>
                  <td className="cell-primary">{user.primerNombre}</td>
                  <td>{user.apellido}</td>
                  <td>{user.email}</td>
                  <td>{user.telefono || "—"}</td>
                  <td>{user.telegramId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo usuario"
      >
        <CreateUserForm onSuccess={() => setModalOpen(false)} />
      </AppModal>
    </div>
  );
};