import { useEffect, useState } from 'react';
import { MainLayout } from '../../templates/MainLayout';
import { getStudents, Student } from '../../../services/studentService';
import { Button } from '../../atoms/Button';
import { useNavigate } from 'react-router-dom';

export function ListPage() {
  const navigate = useNavigate();
  const [students, setStudets] = useState<Student[]>([])

  useEffect(() => {
    (async () => {
      const result = await getStudents()
      setStudets(result)
    })()
  }, [])

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 sm:p-10 max-w-lg">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Alumnos registrados
        </h2>
        {students.length > 0 && (<ul>
          {students.map((student: Student) => (
            <li>{ student.name } - {student.code} - C.I. {student.document}</li>
          ))}
        </ul>)}
        {students.length === 0 && (<div>No hay registros</div>)}
        <Button onClick={() => navigate('/')}>
          Regresar
        </Button>
      </div>
    </MainLayout>
  );
}
