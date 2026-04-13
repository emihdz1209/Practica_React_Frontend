import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import NavBar from '../shared/pages/NavBar';

describe('NavBar', () => {
  test('renders all navigation links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Tareas')).toBeInTheDocument();
    expect(screen.getByText('Proyectos')).toBeInTheDocument();
    expect(screen.getByText('Equipos')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
  });

  test('links have correct hrefs', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    );
    expect(screen.getByText('Inicio').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Tareas').closest('a')).toHaveAttribute('href', '/tareas');
    expect(screen.getByText('Proyectos').closest('a')).toHaveAttribute('href', '/proyectos');
    expect(screen.getByText('Equipos').closest('a')).toHaveAttribute('href', '/equipos');
    expect(screen.getByText('Usuarios').closest('a')).toHaveAttribute('href', '/users');
  });
});
