import { HTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'elevated' | 'bordered' | 'highlight';

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  default: 'shadow-sm',
  elevated: 'shadow-md',
  bordered: 'border',
  highlight: 'border-l-4',
};

export default function Card({ variant = 'default', children, className = '', style, ...props }: Props) {
  return (
    <div
      {...props}
      className={`rounded-2xl p-4 ${variants[variant]} ${className}`}
      style={{
        background: 'var(--bg-card)',
        borderColor: variant === 'bordered' ? 'var(--border)' : variant === 'highlight' ? 'var(--color-primary)' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
