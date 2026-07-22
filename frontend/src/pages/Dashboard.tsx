import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Seal from '../components/Seal';

export default function Dashboard() {
  const { studentUserId, logoutStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutStudent();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ledger flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={36} />
            <span className="font-display text-lg tracking-tight">Student Result Portal</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted hidden sm:inline">
              Signed in as <span className="font-mono text-parchment-dim">{studentUserId}</span>
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-parchment-dim hover:border-crimson/50 hover:text-crimson transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-2xl text-center animate-rise">
          <p className="text-muted uppercase tracking-[0.2em] text-xs mb-3">Welcome Student</p>
          <h1 className="font-display text-3xl sm:text-4xl mb-10 text-parchment">
            What would you like to check today?
          </h1>

          <button
            onClick={() => navigate('/results/semester-4')}
            className="group relative w-full text-left glass-card rounded-2xl p-8 sm:p-10 transition-all duration-300 hover:-translate-y-1 hover:border-brass/40"
          >
            <div className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-emerald-light" aria-hidden="true" />
            <div className="flex items-start gap-5">
              <div className="shrink-0 h-14 w-14 rounded-xl bg-brass/15 border border-brass/30 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="var(--color-brass-light)" strokeWidth="1.5" />
                  <path d="M15 3v5h5" stroke="var(--color-brass-light)" strokeWidth="1.5" />
                  <path d="M8 13h8M8 17h5" stroke="var(--color-brass-light)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-2xl text-parchment mb-1.5">
                  Semester IV Examination Result
                </h2>
                <p className="text-muted text-sm">Click to view your examination result.</p>
              </div>
              <svg
                className="ml-auto shrink-0 mt-2 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                width="22" height="22" viewBox="0 0 24 24" fill="none"
              >
                <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--color-brass-light)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
