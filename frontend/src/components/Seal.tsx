interface SealProps {
  size?: number;
  className?: string;
}

/** Institutional seal mark — the page's signature element. */
export default function Seal({ size = 64, className = '' }: SealProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full seal-ring ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: size * 0.78,
          height: size * 0.78,
          background: 'linear-gradient(155deg, var(--color-brass-light), var(--color-brass))',
        }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.4} height={size * 0.4} fill="none">
          <path
            d="M12 3l7 3.2v4.3c0 4.4-2.9 8.3-7 9.5-4.1-1.2-7-5.1-7-9.5V6.2L12 3z"
            fill="var(--color-ink-950)"
          />
          <path
            d="M9 12.2l2.1 2.1L15.5 10"
            stroke="var(--color-brass-light)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
