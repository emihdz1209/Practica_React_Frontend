import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../shared/pages/DashboardPage';

// Mock the hooks
jest.mock('../features/tareas/hooks/useTareas', () => ({
  useTareas: () => ({
    data: [
      { taskId: '1', titulo: 'Task 1', estadoId: 1, prioridadId: 1, fechaLimite: '2026-04-01T00:00:00' },
      { taskId: '2', titulo: 'Task 2', estadoId: 3, prioridadId: 2, fechaLimite: '2026-03-15T00:00:00' },
      { taskId: '3', titulo: 'Task 3', estadoId: 2, prioridadId: 3, fechaLimite: '2026-05-01T00:00:00' },
    ],
    isLoading: false,
  }),
}));

jest.mock('../features/proyectos/hooks/useProyectos', () => ({
  useProyectos: () => ({
    data: [{ projectId: 'p1', nombre: 'Project A' }],
    isLoading: false,
  }),
}));

jest.mock('../features/equipos/hooks/useEquipos', () => ({
  useEquipos: () => ({
    data: [{ teamId: 't1', nombre: 'Team X' }],
    isLoading: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DashboardPage', () => {
  test('renders the title', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Sistema de Gestion de Tareas')).toBeInTheDocument();
  });

  test('displays active tasks count card', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Tareas Activas')).toBeInTheDocument();
  });

  test('displays completed tasks card', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Completadas')).toBeInTheDocument();
  });

  test('displays project and team cards', () => {
    renderWithProviders(<DashboardPage />);
    // Both nav and cards have these text, use getAllByText
    expect(screen.getAllByText('Proyectos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Equipos').length).toBeGreaterThanOrEqual(1);
  });

  test('shows active tasks table with task titles', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Tareas Pendientes')).toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    // Tareas exists in both nav and table headers
    expect(screen.getAllByText('Tareas').length).toBeGreaterThanOrEqual(1);
  });
});
