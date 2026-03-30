'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  glow?: boolean;
}

export function Card({ children, className = '', padding = true, glow = false }: CardProps) {
  return (
    <div
      className={`cn-panel ${padding ? 'p-4' : ''} ${className}`}
      style={{
        boxShadow: glow ? 'var(--cn-shadow-glow)' : 'var(--cn-shadow-sm)',
      }}
    >
      {children}
    </div>
  );
}
