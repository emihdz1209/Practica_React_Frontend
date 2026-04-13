import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/router/routes';
import { useAuth } from '../../features/auth/context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const NAV_ITEMS = [
  { path: ROUTES.home,      label: 'Inicio',    icon: <DashboardOutlinedIcon /> },
  { path: ROUTES.tareas,    label: 'Tareas',    icon: <AssignmentOutlinedIcon /> },
  { path: ROUTES.proyectos, label: 'Proyectos', icon: <AccountTreeOutlinedIcon /> },
  { path: ROUTES.equipos,   label: 'Equipos',   icon: <GroupOutlinedIcon /> },
  { path: ROUTES.users,     label: 'Usuarios',  icon: <PersonOutlineIcon /> },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  const portal = ReactDOM.createPortal(
    <>
      {/* Floating toggle button */}
      <button
        className="nav-toggle-btn"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        style={{ display: open ? 'none' : 'flex' }}
      >
        <MenuIcon />
      </button>

      {/* Dim backdrop */}
      {open && (
        <div className="nav-backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Left-side sliding panel */}
      <div
        className={`nav-panel${open ? ' nav-open' : ''}`}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="nav-header">
          <div className="nav-logo">
            <span className="nav-logo-icon">✓</span>
            <span>Task Manager</span>
          </div>
          <button
            className="nav-close-btn"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="nav-links">
          {NAV_ITEMS.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link${location.pathname === path ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* User info + logout */}
        <div className="nav-user">
          {user && (
            <span className="nav-user-email">{user.email}</span>
          )}
          <button className="nav-logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            <span>Cerrar sesión</span>
          </button>
        </div>

        <div className="nav-footer">MtdrSpring · v1.0</div>
      </div>
    </>,
    document.body
  );

  return portal;
}
