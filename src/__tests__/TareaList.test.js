import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import TareaList from '../features/tareas/components/TareaList';

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

const mockProyectos = [
  { projectId: 'proj-1', nombre: 'Project Alpha' },
  { projectId: 'proj-2', nombre: 'Project Beta' },
];

const mockTareas = [
  {
    taskId: 'task-1', titulo: 'Active Task', descripcion: 'Active desc',
    estadoId: 1, prioridadId: 1, proyectId: 'proj-1',
    fechaLimite: '2026-04-01T00:00:00', tiempoEstimado: 4, tiempoReal: null,
  },
  {
    taskId: 'task-2', titulo: 'In Progress Task', descripcion: null,
    estadoId: 2, prioridadId: 2, proyectId: 'proj-2',
    fechaLimite: '2026-05-15T00:00:00', tiempoEstimado: null, tiempoReal: 3,
  },
  {
    taskId: 'task-3', titulo: 'Completed Task', descripcion: 'Done',
    estadoId: 3, prioridadId: 3, proyectId: 'proj-1',
    fechaLimite: '2026-03-20T00:00:00', tiempoEstimado: 2, tiempoReal: 2.5,
  },
];

describe('TareaList', () => {
  const onDelete = jest.fn();
  const onStatusChange = jest.fn();

  test('shows empty message when no tasks', () => {
    renderWithProviders(
      <TareaList tareas={[]} onDelete={onDelete} onStatusChange={onStatusChange} proyectos={mockProyectos} />
    );
    expect(screen.getByText('No hay tareas registradas')).toBeInTheDocument();
  });

  test('renders active tasks section', () => {
    renderWithProviders(
      <TareaList tareas={mockTareas} onDelete={onDelete} onStatusChange={onStatusChange} proyectos={mockProyectos} />
    );
    expect(screen.getByText(/Tareas Activas/)).toBeInTheDocument();
    expect(screen.getByText('Active Task')).toBeInTheDocument();
    expect(screen.getByText('In Progress Task')).toBeInTheDocument();
  });

  test('renders completed tasks section', () => {
    renderWithProviders(
      <TareaList tareas={mockTareas} onDelete={onDelete} onStatusChange={onStatusChange} proyectos={mockProyectos} />
    );
    expect(screen.getByText(/Completadas/)).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  test('displays project names correctly', () => {
    renderWithProviders(
      <TareaList tareas={mockTareas} onDelete={onDelete} onStatusChange={onStatusChange} proyectos={mockProyectos} />
    );
    expect(screen.getAllByText('Project Alpha').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Project Beta')).toBeInTheDocument();
  });

  test('displays priority chips', () => {
    renderWithProviders(
      <TareaList tareas={mockTareas} onDelete={onDelete} onStatusChange={onStatusChange} proyectos={mockProyectos} />
    );
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Baja')).toBeInTheDocument();
  });

  test('displays time estimates when available', () => {
    renderWithProviders(
      <TareaList tareas={mockTareas} onDelete={onDelete} onStatusChange={onStatusChange} proyectos={mockProyectos} />
    );
    expect(screen.getByText('4h')).toBeInTheDocument();
    expect(screen.getByText('2.5h')).toBeInTheDocument();
  });
});
