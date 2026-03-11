import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../templates/MainLayout';
import { Button } from '../../atoms/Button';
import { createStudent } from '../../../services/studentService';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createStudent({
        name: name.trim(),
        document: document.trim(),
        birthDate,
      });
      navigate('/', { state: { registered: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 sm:p-10 max-w-lg">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Inscripción de alumno
        </h2>
        <p className="mt-2 text-slate-600 text-sm">
          Completa el formulario. Se asignará un número de registro automáticamente.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María García López"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/50 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="document"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Documento
            </label>
            <input
              id="document"
              type="text"
              required
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="Ej. DNI, pasaporte..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/50 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Fecha de nacimiento
            </label>
            <input
              id="birthDate"
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm ring-1 ring-slate-200/50 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando…' : 'Registrar alumno'}
            </Button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
