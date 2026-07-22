import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../api/client';
import Seal from '../components/Seal';
import Spinner from '../components/Spinner';

export default function AdminLogin() {
  const { loginAdmin, isAdminAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userId.trim() || !password) {
      setError('Enter the Admin User ID and Password to continue.');
      return;
    }
    setLoading(true);
    try {
      await loginAdmin(userId.trim(), password);
      showToast('Welcome back, Admin.', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to reach the server.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ledger flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 opacity-[0.05]">
        <Seal size={380} />
      </div>

      <div className="w-full max-w-md animate-rise relative">
        <div className="flex flex-col items-center text-center mb-7">
          <Seal size={60} />
          <span className="mt-4 inline-block text-[11px] font-medium tracking-[0.2em] uppercase text-emerald-light border border-emerald/40 rounded-full px-3 py-1">
            Administrator
          </span>
          <h1 className="font-display text-3xl mt-4 tracking-tight text-parchment">
            Admin Panel
          </h1>
          <p className="text-muted mt-2 text-sm">Student Result Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-7 sm:p-8" noValidate>
          <div className="space-y-5">
            <div>
              <label htmlFor="adminUserId" className="block text-xs font-medium tracking-wide uppercase text-parchment-dim mb-2">
                Admin User ID
              </label>
              <input
                id="adminUserId"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. admin"
                className="w-full rounded-xl bg-ink-950/50 border border-white/10 px-4 py-3 text-parchment placeholder:text-muted/60 focus:border-emerald/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-xs font-medium tracking-wide uppercase text-parchment-dim mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-ink-950/50 border border-white/10 px-4 py-3 pr-20 text-parchment placeholder:text-muted/60 focus:border-emerald/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-muted hover:text-emerald-light transition-colors"
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald text-parchment font-semibold py-3 hover:bg-emerald-light hover:text-ink-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Spinner size={16} />}
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted mt-6">
          Not an administrator?{' '}
          <a href="/login" className="text-brass-light hover:underline">
            Student login
          </a>
        </p>
      </div>
    </div>
  );
}
