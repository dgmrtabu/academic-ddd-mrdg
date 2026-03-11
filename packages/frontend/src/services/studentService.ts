const API_BASE = '/api';

export type Student = {
  id: string;
  name: string;
  document: string;
  birthDate: string;
  code: string;
};

export type CreateStudentDto = {
  name: string;
  document: string;
  birthDate: string;
};

export async function createStudent(data: CreateStudentDto): Promise<Student> {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'Error al registrar alumno');
  }
  return res.json();
}

export async function getStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/students`);
  if (!res.ok) throw new Error('Error al cargar alumnos');
  return res.json();
}
