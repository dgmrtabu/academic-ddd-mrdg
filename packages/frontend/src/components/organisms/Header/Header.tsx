import { useAuthStore } from '../../../stores';

export function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sistema Académico
          </h1>
        </div>
        {user && (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200/60">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            <span className="font-medium">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
