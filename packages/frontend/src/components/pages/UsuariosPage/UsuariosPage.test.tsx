import { describe, expect, it, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { UsuariosPage } from './UsuariosPage';
import { apiRequest } from '../../../lib/api';

// Mock del API
vi.mock('../../../lib/api', () => ({
  apiRequest: vi.fn(),
}));

// Mock del Store de autenticación y temas (ya que MainLayout/Sidebar los necesitan)
vi.mock('../../../stores', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../stores')>();
  return {
    ...actual,
    useAuthStore: vi.fn((selector) =>
      selector({
        user: {
          id: 'admin-1',
          name: 'admin',
          email: 'admin@academic.local',
          role: { id: 'role-1', name: 'ADMINISTRATOR' },
        },
      })
    ),
    useThemeStore: vi.fn((selector) =>
      selector({
        theme: 'light',
        toggleTheme: vi.fn(),
        setTheme: vi.fn(),
      })
    ),
  };
});

const mockApiRequest = vi.mocked(apiRequest);

describe('UsuariosPage', () => {
  const mockUsers = [
    { id: 'user-1', username: 'jperez', email: 'jperez@uni.edu', role: { id: 'role-2', name: 'STUDENT' } },
    { id: 'user-2', username: 'mgomez', email: 'mgomez@uni.edu', role: { id: 'role-3', name: 'TEACHER' } },
  ];
  
  const mockRoles = [
    { id: 'role-1', name: 'ADMINISTRATOR' },
    { id: 'role-2', name: 'STUDENT' },
    { id: 'role-3', name: 'TEACHER' },
  ];

  function renderPage() {
    return render(
      <MemoryRouter>
        <UsuariosPage />
      </MemoryRouter>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente y carga la lista de usuarios', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/users') return Promise.resolve(mockUsers);
      if (url === '/roles') return Promise.resolve(mockRoles);
      return Promise.reject(new Error('Ruta no encontrada'));
    });

    renderPage();

    expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
    
    // Debería mostrar spinner mientras carga
    expect(screen.getByText('Cargando datos de usuarios...')).toBeInTheDocument();

    // Esperar a que los datos se pongan
    await waitFor(() => {
      expect(screen.getByText('jperez')).toBeInTheDocument();
    });

    expect(screen.getByText('mgomez')).toBeInTheDocument();
    expect(screen.getByText('jperez@uni.edu')).toBeInTheDocument();
  });

  it('permite abrir el modal para agregar un nuevo usuario', async () => {
    mockApiRequest.mockImplementation((url: string) => {
      if (url === '/users') return Promise.resolve(mockUsers);
      if (url === '/roles') return Promise.resolve(mockRoles);
      return Promise.resolve();
    });
    
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('jperez')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /\+ Nuevo Usuario/i });
    await user.click(addBtn);

    expect(screen.getByText('Registrar Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de Usuario/i)).toBeInTheDocument();
  });

  it('permite abrir el modal para editar y guardar cambios', async () => {
    mockApiRequest.mockImplementation(async (url: string, options?: any) => {
      if (url === '/users' && (!options || options.method === 'GET' || !options.method)) return mockUsers;
      if (url === '/roles') return mockRoles;
      if (url.startsWith('/users/') && options?.method === 'PATCH') {
        const payload = JSON.parse(options.body as string);
        return { ...mockUsers[0], ...payload };
      }
      return Promise.resolve();
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('jperez')).toBeInTheDocument();
    });

    // Encontrar todos los botones de editar y darle clic al primero
    const editBtns = screen.getAllByRole('button', { name: /Editar/i });
    await user.click(editBtns[0]);

    expect(await screen.findByText('Editar Perfil de Usuario')).toBeInTheDocument();
    
    // Editar el email
    const emailInput = screen.getByLabelText(/Correo Electrónico/i) as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, 'jperez_modificado@uni.edu');

    // Guardar
    const saveBtn = screen.getByRole('button', { name: /Guardar Usuario/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Usuario actualizado exitosamente')).toBeInTheDocument();
    });
  });

  it('permite abrir el modal para eliminar y confirmar eliminación', async () => {
    mockApiRequest.mockImplementation((url: string, options?: any) => {
      if (url === '/users' && (!options || !options.method)) return Promise.resolve([mockUsers[0]]); // Solo cargar al de prueba
      if (url === '/roles') return Promise.resolve(mockRoles);
      if (url === '/users/user-1' && options?.method === 'DELETE') return Promise.resolve({ success: true });
      return Promise.resolve();
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('jperez')).toBeInTheDocument();
    });

    // Clic en eliminar
    const delBtns = screen.getAllByRole('button', { name: /Eliminar/i });
    await user.click(delBtns[0]);

    // Modal de confirmación
    expect(await screen.findByText('¿Eliminar usuario?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Sí, eliminar/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText('Usuario jperez eliminado con éxito')).toBeInTheDocument();
    });
    
    // Verificar que la API de eliminar fue llamada
    expect(mockApiRequest).toHaveBeenCalledWith('/users/user-1', { method: 'DELETE' });
  });
});
