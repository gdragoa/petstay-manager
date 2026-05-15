import { createPortal } from 'react-dom';
import { useToast, ToastType } from '../../contexts/ToastContext';

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
  warning: '!',
};

const colors: Record<ToastType, string> = {
  success: '#10B981',
  error: '#EF4444',
  info: '#6366F1',
  warning: '#F59E0B',
};

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 sm:right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 items-center sm:items-end">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[260px] sm:max-w-sm px-4 py-3 rounded-2xl shadow-lg animate-[slideUp_0.2s_ease-out]"
          style={{ background: 'var(--bg-card)', border: `1.5px solid ${colors[t.type]}22` }}
        >
          <span
            className="flex-none flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
            style={{ background: colors[t.type] }}
          >
            {icons[t.type]}
          </span>
          <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="flex-none text-xs opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
