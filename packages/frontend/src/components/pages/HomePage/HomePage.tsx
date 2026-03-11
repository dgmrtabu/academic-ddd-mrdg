import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../templates/MainLayout';
import { Button } from '../../atoms/Button';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Bienvenido
        </h2>
        <p className="mt-3 max-w-xl text-slate-600 leading-relaxed">
          Frontend con Vite, React, Atomic Design, Tailwind CSS y Zustand.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/registro')}>
            Regístrate como estudiante
          </Button>
          <Button onClick={() => navigate('/estudiantes')}>
            Ver lista de estudiantes
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
