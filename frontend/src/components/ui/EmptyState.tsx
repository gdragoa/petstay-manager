import { ReactNode } from 'react';
import Button from './Button';

interface Props {
  emoji?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ emoji = '🐾', title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <span className="text-5xl">{emoji}</span>
      <div>
        <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</p>
        {description && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} size="sm">{action.label}</Button>
      )}
    </div>
  );
}
