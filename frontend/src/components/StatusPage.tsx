import { useNavigate } from 'react-router-dom';
import Seal from './Seal';

interface StatusPageProps {
  code: string;
  title: string;
  message: string;
}

export default function StatusPage({ code, title, message }: StatusPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ledger flex items-center justify-center px-4 text-center">
      <div className="animate-rise">
        <Seal size={56} className="mx-auto mb-6" />
        <p className="font-mono text-brass-light text-sm tracking-[0.3em] mb-3">{code}</p>
        <h1 className="font-display text-3xl text-parchment mb-3">{title}</h1>
        <p className="text-muted mb-8 max-w-sm mx-auto">{message}</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl bg-brass text-ink-950 font-semibold px-6 py-2.5 hover:bg-brass-light transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}
