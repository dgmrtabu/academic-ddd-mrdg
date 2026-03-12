import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  type CreateStudentDto,
  type UpdateStudentDto,
} from './studentService';

const API_BASE = '/api';

describe('studentService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('getStudents', () => {
    it('debería devolver la lista de estudiantes', async () => {
      const list = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          document: '123',
          birthDate: '2000-01-01',
          code: 'ALUMNO-00001',
          userId: 'u1',
        },
      ];
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(list),
      });

      const result = await getStudents();

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/students`);
      expect(result).toEqual(list);
    });

    it('debería lanzar si la respuesta no es ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });

      await expect(getStudents()).rejects.toThrow('Error al cargar alumnos');
    });
  });

  describe('getStudent', () => {
    it('debería devolver un estudiante por id', async () => {
      const student = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        document: '123',
        birthDate: '2000-01-01',
        code: 'ALUMNO-00001',
        userId: 'u1',
        username: 'jdoe',
        email: 'jdoe@test.com',
      };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(student),
      });

      const result = await getStudent('1');

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/students/1`);
      expect(result).toEqual(student);
    });

    it('debería lanzar "Estudiante no encontrado" en 404', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getStudent('inexistente')).rejects.toThrow(
        'Estudiante no encontrado',
      );
    });

    it('debería lanzar error genérico en otro error', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getStudent('1')).rejects.toThrow('Error al cargar alumno');
    });
  });

  describe('createStudent', () => {
    const dto: CreateStudentDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      document: '87654321',
      birthDate: '2001-05-15',
      email: 'jane@test.com',
    };

    it('debería crear estudiante y devolverlo', async () => {
      const created = {
        id: '2',
        ...dto,
        code: 'ALUMNO-00002',
        userId: 'u2',
      };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(created),
      });

      const result = await createStudent(dto);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      expect(result).toEqual(created);
    });

    it('debería lanzar con mensaje del servidor si no es ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Documento duplicado' }),
      });

      await expect(createStudent(dto)).rejects.toThrow('Documento duplicado');
    });

    it('debería usar statusText cuando el json falla', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error',
        json: () => Promise.reject(new Error('parse error')),
      });

      await expect(createStudent(dto)).rejects.toThrow('Server Error');
    });
  });

  describe('updateStudent', () => {
    const dto: UpdateStudentDto = { firstName: 'Juan', lastName: 'Pérez' };

    it('debería actualizar y devolver el estudiante', async () => {
      const updated = {
        id: '1',
        firstName: 'Juan',
        lastName: 'Pérez',
        document: '123',
        birthDate: '2000-01-01',
        code: 'ALUMNO-00001',
        userId: 'u1',
      };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updated),
      });

      const result = await updateStudent('1', dto);

      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/students/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      expect(result).toEqual(updated);
    });

    it('debería lanzar si la respuesta no es ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Validation failed' }),
      });

      await expect(updateStudent('1', dto)).rejects.toThrow('Validation failed');
    });
  });

  describe('deleteStudent', () => {
    it('debería enviar DELETE y no lanzar si ok', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

      await expect(deleteStudent('1')).resolves.toBeUndefined();
      expect(fetch).toHaveBeenCalledWith(`${API_BASE}/students/1`, {
        method: 'DELETE',
      });
    });

    it('debería lanzar "Estudiante no encontrado" en 404', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(deleteStudent('inexistente')).rejects.toThrow(
        'Estudiante no encontrado',
      );
    });

    it('debería lanzar error genérico en otro error', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      await expect(deleteStudent('1')).rejects.toThrow('Server error');
    });
  });
});
