'use client';

import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon
        size={48}
        strokeWidth={1.5}
        style={{ color: 'var(--cn-text-secondary)', opacity: 0.5 }}
      />
      <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--cn-text-primary)' }}>
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm max-w-sm" style={{ color: 'var(--cn-text-secondary)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
