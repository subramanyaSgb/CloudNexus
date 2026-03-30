'use client';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: 'var(--cn-bg-tertiary)', color: 'var(--cn-text-secondary)' },
  success: { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--cn-success)' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--cn-warning)' },
  danger: { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--cn-danger)' },
  accent: { bg: 'var(--cn-accent-glow)', color: 'var(--cn-accent)' },
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${className}`}
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
      }}
    >
      {children}
    </span>
  );
}
