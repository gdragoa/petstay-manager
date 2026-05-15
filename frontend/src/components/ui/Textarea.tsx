import { TextareaHTMLAttributes, forwardRef } from 'react';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          {...props}
          className={`
            w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all resize-none
            focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-30
            ${error ? 'border-[var(--color-danger)]' : 'border-[var(--border)]'}
            ${className}
          `}
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          rows={props.rows || 3}
        />
        {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
