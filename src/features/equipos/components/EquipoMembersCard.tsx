import { Button, CircularProgress } from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TeamMember } from "@/features/equipos/services/equipoMemberService";
import type { User } from "@/features/users/types/user";
import styles from "../pages/EquipoDetailPage.module.css";

interface EquipoMembersCardProps {
  members: TeamMember[];
  users: User[];
  isLoading: boolean;
  onAddMember: () => void;
  onRemoveMember: (userId: string) => void;
  isRemoving: boolean;
}

const roleLabelById: Record<number, string> = {
  1: "MANAGER",
  2: "DEVELOPER",
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

const normalizeId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const EquipoMembersCard = ({
  members,
  users,
  isLoading,
  onAddMember,
  onRemoveMember,
  isRemoving,
}: EquipoMembersCardProps) => {
  const usersById = Object.fromEntries(
    users.map((user) => [normalizeId(user.userId), user])
  );

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderTitle}>
          <h3>Miembros</h3>
          <p>{members.length} en este equipo</p>
        </div>

        <Button variant="contained" startIcon={<PersonAddAlt1Icon fontSize="small" />} onClick={onAddMember} className="AddButton">
          Añadir
        </Button>
      </div>

      <div className={styles.cardBody}>
        {isLoading ? (
          <div className={styles.projectEmpty}>
            <CircularProgress size={22} />
          </div>
        ) : members.length === 0 ? (
          <div className={styles.projectEmpty}>Aún no hay miembros. Añade el primero.</div>
        ) : (
          <div className={styles.membersList}>
            {members.map((member) => {
              const user = usersById[normalizeId(member.userId)];

              return (
                <article className={styles.memberRow} key={member.userId}>
                  <div className={styles.memberIdentity}>
                    <div className={styles.memberAvatar}>
                      {user ? getInitials(user.primerNombre, user.apellido) : "?"}
                    </div>

                    <div className={styles.memberMeta}>
                      <span className={styles.memberName}>
                        {user ? `${user.primerNombre} ${user.apellido}` : member.userId}
                      </span>
                      <span className={styles.memberEmail}>{user?.email ?? "Sin correo disponible"}</span>
                    </div>
                  </div>

                  <div className={styles.memberActions}>
                    {user && <span className={styles.memberBadge}>{roleLabelById[user.rolId] ?? `ROL ${user.rolId}`}</span>}

                    <Button
                      variant="text"
                      color="error"
                      onClick={() => onRemoveMember(member.userId)}
                      className={styles.memberRemove}
                      disabled={isRemoving}
                      startIcon={<DeleteIcon fontSize="small" />}
                    >
                      Eliminar
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
