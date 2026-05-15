type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';

interface Props { variant?: Variant; children: React.ReactNode; className?: string }

const styles: Record<Variant, { bg: string; color: string }> = {
  success:  { bg: '#D1FAE5', color: '#065F46' },
  warning:  { bg: '#FEF3C7', color: '#92400E' },
  error:    { bg: '#FEE2E2', color: '#991B1B' },
  info:     { bg: '#DBEAFE', color: '#1E40AF' },
  neutral:  { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' },
  pending:  { bg: '#FED7AA', color: '#9A3412' },
};

export default function Badge({ variant = 'neutral', children, className = '' }: Props) {
  const s = styles[variant];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{ background: s.bg, color: s.color }}
    >
      {children}
    </span>
  );
}
