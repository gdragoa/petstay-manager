import { SelectHTMLAttributes, forwardRef } from 'react';

interface Option { value: string; label: string }

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          {...props}
          className={`
            w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all cursor-pointer
            focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-30
            ${error ? 'border-[var(--color-danger)]' : 'border-[var(--border)]'}
            ${className}
          `}
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
