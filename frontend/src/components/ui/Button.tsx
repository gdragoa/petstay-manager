import { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'text-white font-semibold shadow-sm hover:opacity-90 active:opacity-80',
  secondary: 'bg-[var(--bg-hover)] text-[var(--text-primary)] hover:opacity-80 font-medium',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] font-medium',
  danger: 'bg-[var(--color-danger)] text-white font-semibold hover:opacity-90',
  outline: 'border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  style,
  ...props
}: Props) {
  const isPrimary = variant === 'primary';

  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed select-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      style={isPrimary ? { backgroundColor: 'var(--color-primary)', ...style } : style}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </button>
  );
}
