import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiDelete, apiGet, apiUpload, ApiError } from '../api/client';
import type { StudentResult } from '../types';
import Seal from '../components/Seal';
import Spinner from '../components/Spinner';
import Skeleton from '../components/Skeleton';

export default function AdminDashboard() {
  const { adminUserId, logoutAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const [results, setResults] = useState<StudentResult[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadResults = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await apiGet<StudentResult[]>('/api/admin/results', 'admin');
      setResults(data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to load results.', 'error');
    } finally {
      setListLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login', { replace: true });
  };

  const resetForm = () => {
    setStudentName('');
    setRollNumber('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!studentName.trim() || !rollNumber.trim() || !file) {
      setFormError('Student Name, Roll Number, and a PDF file are all required.');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFormError('Only PDF files are accepted.');
      return;
    }

    const formData = new FormData();
    formData.append('student_name', studentName.trim());
    formData.append('roll_number', rollNumber.trim());
    formData.append('file', file);

    setUploading(true);
    try {
      await apiUpload('/api/admin/results', formData, 'admin');
      showToast('Result uploaded successfully.', 'success');
      resetForm();
      loadResults();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Upload failed. Please try again.';
      setFormError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, roll: string) => {
    if (!window.confirm(`Delete the result for Roll Number ${roll}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await apiDelete(`/api/admin/results/${id}`, 'admin');
      showToast('Result deleted.', 'success');
      setResults((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete result.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-ledger flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Seal size={34} />
            <div>
              <div className="font-display text-lg leading-tight">Admin Panel</div>
              <div className="text-[11px] text-emerald-light tracking-wide uppercase">Student Result Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted hidden sm:inline">
              Signed in as <span className="font-mono text-parchment-dim">{adminUserId}</span>
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-10 grid gap-8 lg:grid-cols-[380px_1fr]">
        <section className="animate-rise">
          <h2 className="font-display text-xl mb-4 text-parchment">Upload Student Result</h2>
          <form onSubmit={handleUpload} className="glass-card rounded-2xl p-6 space-y-4">
            <div>
              <label htmlFor="studentName" className="block text-xs font-medium tracking-wide uppercase text-parchment-dim mb-2">
                Student Name
              </label>
              <input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Rehan Kumar"
                className="w-full rounded-xl bg-ink-950/50 border border-white/10 px-4 py-2.5 text-parchment placeholder:text-muted/60 focus:border-emerald/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="rollNumber" className="block text-xs font-medium tracking-wide uppercase text-parchment-dim mb-2">
                Roll Number
              </label>
              <input
                id="rollNumber"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. CS2021001"
                className="w-full rounded-xl bg-ink-950/50 border border-white/10 px-4 py-2.5 font-mono text-parchment placeholder:text-muted/60 focus:border-emerald/60 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="pdfFile" className="block text-xs font-medium tracking-wide uppercase text-parchment-dim mb-2">
                Upload Result PDF
              </label>
              <input
                id="pdfFile"
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-emerald/20 file:text-emerald-light file:px-3 file:py-2 file:cursor-pointer hover:file:bg-emerald/30"
              />
            </div>

            {formError && (
              <p role="alert" className="text-sm text-crimson bg-crimson/10 border border-crimson/30 rounded-lg px-3 py-2 animate-fade">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald text-parchment font-semibold py-2.5 hover:bg-emerald-light hover:text-ink-950 transition-colors disabled:opacity-60"
            >
              {uploading && <Spinner size={16} />}
              {uploading ? 'Saving…' : 'Save'}
            </button>
          </form>
        </section>

        <section className="animate-rise">
          <h2 className="font-display text-xl mb-4 text-parchment">Uploaded Results</h2>
          <div className="glass-card rounded-2xl overflow-hidden">
            {listLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : results.length === 0 ? (
              <p className="p-8 text-center text-muted text-sm">No results uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto custom-scroll">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-parchment-dim uppercase text-[11px] tracking-wide border-b border-white/10">
                      <th className="px-5 py-3 font-medium">Student Name</th>
                      <th className="px-5 py-3 font-medium">Roll Number</th>
                      <th className="px-5 py-3 font-medium">Uploaded</th>
                      <th className="px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3 text-parchment">{r.student_name}</td>
                        <td className="px-5 py-3 font-mono text-brass-light">{r.roll_number}</td>
                        <td className="px-5 py-3 text-muted">
                          {new Date(r.created_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDelete(r.id, r.roll_number)}
                            disabled={deletingId === r.id}
                            className="text-crimson hover:underline disabled:opacity-50 text-sm"
                          >
                            {deletingId === r.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
