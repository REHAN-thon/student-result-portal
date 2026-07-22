import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, ApiError } from '../api/client';
import type { StudentResult } from '../types';
import Spinner from '../components/Spinner';

export default function ResultSearch() {
  const navigate = useNavigate();
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    const roll = rollNumber.trim();
    if (!roll) return;

    setLoading(true);
    try {
      await apiGet<StudentResult>(`/api/results/search?roll_number=${encodeURIComponent(roll)}`, 'student');
      navigate(`/results/semester-4/preview/${encodeURIComponent(roll)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ledger flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-muted hover:text-brass-light transition-colors text-sm flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-md animate-rise">
          <div className="text-center mb-8">
            <p className="text-muted uppercase tracking-[0.2em] text-xs mb-3">Semester IV</p>
            <h1 className="font-display text-3xl text-parchment">Semester IV Examination Result</h1>
          </div>

          <form onSubmit={handleSearch} className="glass-card rounded-2xl p-7 sm:p-8">
            <label htmlFor="roll" className="block text-xs font-medium tracking-wide uppercase text-parchment-dim mb-2">
              Roll Number
            </label>
            <input
              id="roll"
              value={rollNumber}
              onChange={(e) => {
                setRollNumber(e.target.value);
                if (notFound) setNotFound(false);
              }}
              placeholder="e.g. CS2021001"
              className="w-full rounded-xl bg-ink-950/50 border border-white/10 px-4 py-3 font-mono text-parchment placeholder:text-muted/60 focus:border-brass/60 transition-colors"
              autoComplete="off"
            />

            {notFound && (
              <p role="alert" className="mt-3 text-sm text-crimson bg-crimson/10 border border-crimson/30 rounded-lg px-3 py-2 animate-fade">
                Result not found.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !rollNumber.trim()}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-brass text-ink-950 font-semibold py-3 hover:bg-brass-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Spinner size={16} />}
              {loading ? 'Searching…' : 'Search Result'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
