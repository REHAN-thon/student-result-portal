import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../api/client';
import Seal from '../components/Seal';
import Spinner from '../components/Spinner';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Login() {
  const { loginStudent, isStudentAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const now = useClock();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isStudentAuthenticated) navigate('/dashboard', { replace: true });
  }, [isStudentAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userId.trim() || !password) {
      setError('Enter your User ID and Password to continue.');
      return;
    }
    setLoading(true);
    try {
      await loginStudent(userId.trim(), password);
      showToast('Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to reach the server.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ledger flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* ambient corner emblem, full-screen backdrop */}
      <div className="pointer-events-none absolute -top-24 -right-24 opacity-[0.06]">
        <Seal size={420} />
      </div>
      <div className="pointer-events-none absolute -bottom-32 -left-24 opacity-[0.05]">
        <Seal size={340} />
      </div>

      <div className="w-full max-w-md animate-rise relative">
        <div className="flex flex-col items-center text-center mb-7">
          <Seal size={68} />
          <h1 className="font-display text-4xl mt-5 tracking-tight text-parchment">
            Student Result Portal
          </h1>
          <p className="text-muted mt-2 text-sm tracking-wide uppercase">Welcome</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-7 sm:p-8" noValidate>
          <div className="space-y-5">
            <div>
              <label htmlFor="userId" className="block text-xs font-medium tracking-wide uppercase text-parchment-dim mb-2">
                User ID
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. student"
                className="w-full rounded-xl bg-ink-950/50 border border-white/10 px-4 py-3 text-parchment placeholder:text-muted/60 focus:border-brass/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium tracking-wide uppercase text-parchment-dim mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-ink-950/50 border border-white/10 px-4 py-3 pr-20 text-parchment placeholder:text-muted/60 focus:border-brass/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-muted hover:text-brass-light transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-crimson bg-crimson/10 border border-crimson/30 rounded-lg px-3 py-2 animate-fade">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brass text-ink-950 font-semibold py-3 hover:bg-brass-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Spinner size={16} />}
              {loading ? 'Signing in…' : 'Login'}
            </button>

            <div className="flex items-center justify-between text-sm pt-1">
              <button
                type="button"
                onClick={() => showToast('Please contact the examination office to reset your password.', 'info')}
                className="text-muted hover:text-brass-light transition-colors"
              >
                Forgot Password?
              </button>
              <span className="font-mono text-xs text-muted">
                {now.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Administrator?{' '}
          <a href="/admin/login" className="text-brass-light hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
