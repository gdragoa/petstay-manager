import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, prefix, suffix, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 flex items-center" style={{ color: 'var(--text-muted)' }}>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            {...props}
            className={`
              w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all
              focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-30
              ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''}
              ${error ? 'border-[var(--color-danger)]' : 'border-[var(--border)]'}
              ${className}
            `}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          />
          {suffix && (
            <span className="absolute right-3 flex items-center" style={{ color: 'var(--text-muted)' }}>
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
