import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPdfBlob, ApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';
import Spinner from '../components/Spinner';

export default function ResultPreview() {
  const { rollNumber = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const blob = await fetchPdfBlob(rollNumber);
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setBlobUrl(objectUrl);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Unable to load the result.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [rollNumber]);

  const handleDownload = () => {
    if (!blobUrl) return;
    setDownloading(true);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${rollNumber}_SemesterIV_Result.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Download started.', 'success');
    setDownloading(false);
  };

  const handlePrint = () => {
    if (!blobUrl) return;
    const printWindow = window.open(blobUrl, '_blank');
    printWindow?.addEventListener('load', () => printWindow.print());
  };

  return (
    <div className="min-h-screen bg-ledger flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/results/semester-4')}
            className="text-muted hover:text-brass-light transition-colors text-sm flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={!blobUrl || downloading}
              className="rounded-lg bg-brass text-ink-950 font-medium px-4 py-2 text-sm hover:bg-brass-light transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {downloading && <Spinner size={14} />}
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              disabled={!blobUrl}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-parchment-dim hover:border-brass/40 hover:text-brass-light transition-colors disabled:opacity-50"
            >
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">
        <div className="mb-5 text-center">
          <p className="text-muted uppercase tracking-[0.2em] text-xs mb-2">Result Preview</p>
          <h1 className="font-display text-2xl text-parchment">
            Roll Number: <span className="font-mono text-brass-light">{rollNumber.toUpperCase()}</span>
          </h1>
        </div>

        {loading && (
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-[70vh] w-full" />
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <p className="text-crimson text-lg mb-2">Result not found.</p>
            <p className="text-muted text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('/results/semester-4')}
              className="rounded-xl bg-brass text-ink-950 font-semibold px-5 py-2.5 hover:bg-brass-light transition-colors"
            >
              Try another Roll Number
            </button>
          </div>
        )}

        {!loading && !error && blobUrl && (
          <div className="glass-card rounded-2xl overflow-hidden animate-fade">
            <iframe
              src={blobUrl}
              title={`Semester IV Result for ${rollNumber}`}
              className="w-full"
              style={{ height: '75vh', border: 'none' }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
