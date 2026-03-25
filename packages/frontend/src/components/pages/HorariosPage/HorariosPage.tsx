import { useEffect, useState } from 'react';
import { MainLayout } from '../../templates/MainLayout';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { DataTable, type DataTableColumn } from '../../organisms/DataTable';
import { getCourses, type Course } from '../../../services/courseService';
import {
  getClassrooms,
  type Classroom,
} from '../../../services/classroomService';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  type Schedule,
} from '../../../services/scheduleService';

const DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

type ScheduleRow = Schedule & {
  courseLabel: string;
  classroomLabel: string;
};

type ScheduleForm = {
  courseId: string;
  day: string;
  startTime: string;
  endTime: string;
  classroomId: string;
};

const SCHEDULE_COLUMNS: DataTableColumn<ScheduleRow>[] = [
  { id: 'course', label: 'Curso', value: (row) => row.courseLabel },
  { id: 'slot', label: 'Horario', value: (row) => row.slot },
  { id: 'classroom', label: 'Aula', value: (row) => row.classroomLabel },
];

const emptyForm: ScheduleForm = {
  courseId: '',
  day: 'Lunes',
  startTime: '',
  endTime: '',
  classroomId: '',
};

function parseSlot(
  slot: string,
): Pick<ScheduleForm, 'day' | 'startTime' | 'endTime'> {
  const match = slot.match(
    /^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/,
  );

  if (!match) {
    return {
      day: 'Lunes',
      startTime: '',
      endTime: '',
    };
  }

  return {
    day: match[1],
    startTime: match[2],
    endTime: match[3],
  };
}

function buildSlot(day: string, startTime: string, endTime: string): string {
  return `${day} ${startTime}-${endTime}`;
}

function isValidTimeRange(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

export function HorariosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [form, setForm] = useState<ScheduleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseRows, classroomRows, scheduleRows] = await Promise.all([
        getCourses(),
        getClassrooms(),
        getSchedules(),
      ]);
      setCourses(courseRows);
      setClassrooms(classroomRows);
      setSchedules(scheduleRows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const rows: ScheduleRow[] = schedules.map((schedule) => {
    const course = courses.find((item) => item.id === schedule.courseId);
    const classroom = classrooms.find((item) => item.id === schedule.classroomId);

    return {
      ...schedule,
      courseLabel: course ? `${course.code} - ${course.name}` : schedule.courseId,
      classroomLabel: classroom
        ? `${classroom.code} - ${classroom.building}`
        : 'Sin aula',
    };
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidTimeRange(form.startTime, form.endTime)) {
      setError('La hora de inicio debe ser menor que la hora de fin');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        courseId: form.courseId,
        slot: buildSlot(form.day, form.startTime, form.endTime),
        classroomId: form.classroomId,
      };

      if (editingId) {
        await updateSchedule(editingId, payload);
      } else {
        await createSchedule(payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar horario');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row: Schedule) => {
    const parsed = parseSlot(row.slot);

    setEditingId(row.id);
    setForm({
      courseId: row.courseId,
      day: parsed.day,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      classroomId: row.classroomId ?? '',
    });
  };

  const handleDelete = async (row: ScheduleRow) => {
    if (!window.confirm(`Eliminar el horario "${row.slot}"?`)) return;

    setDeletingId(row.id);
    setError(null);

    try {
      await deleteSchedule(row.id);
      if (editingId === row.id) resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar horario');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,420px)]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Horarios
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Asigna un aula a cada horario registrado.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <DataTable<ScheduleRow>
              columns={SCHEDULE_COLUMNS}
              data={rows}
              keyExtractor={(row) => row.id}
              emptyMessage="No hay horarios registrados."
              renderActions={(row) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(row)}
                    disabled={deletingId === row.id}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50"
                  >
                    {deletingId === row.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              )}
            />
          </div>

          {loading && (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Cargando...
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm ring-1 ring-slate-200/50 dark:border-slate-600 dark:bg-slate-800/95 dark:ring-slate-600/50 sm:p-10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingId ? 'Editar horario' : 'Nuevo horario'}
          </h3>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="courseId"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Curso
              </label>
              <select
                id="courseId"
                required
                value={form.courseId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, courseId: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm ring-1 ring-slate-200/50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600/50"
              >
                <option value="">Selecciona un curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="day"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Día
              </label>
              <select
                id="day"
                required
                value={form.day}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, day: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm ring-1 ring-slate-200/50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600/50"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Hora inicio
                </label>
                <Input
                  id="startTime"
                  type="time"
                  required
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      startTime: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Hora fin
                </label>
                <Input
                  id="endTime"
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      endTime: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="classroomId"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Aula
              </label>
              <select
                id="classroomId"
                required
                value={form.classroomId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, classroomId: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm ring-1 ring-slate-200/50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600/50"
              >
                <option value="">Selecciona un aula</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.code} - {classroom.building}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving || courses.length === 0 || classrooms.length === 0}
              >
                {saving
                  ? 'Guardando...'
                  : editingId
                    ? 'Actualizar horario'
                    : 'Crear horario'}
              </Button>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
            </div>

            {classrooms.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-300">
                Primero registra al menos un aula para poder crear horarios.
              </p>
            )}
          </form>
        </section>
      </div>
    </MainLayout>
  );
}
