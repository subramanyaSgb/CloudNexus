'use client';

import { CheckCircle, Upload } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'uploading';
  visible: boolean;
}

export function Toast({ message, type = 'success', visible }: ToastProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed left-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium"
      style={{
        bottom: 140,
        transform: 'translateX(-50%)',
        backgroundColor: type === 'uploading' ? 'var(--cn-accent)' : 'var(--cn-success)',
        color: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        animation: 'cn-fade-in 200ms ease-out',
        whiteSpace: 'nowrap',
      }}
    >
      {type === 'uploading' ? (
        <Upload size={16} className="animate-pulse" />
      ) : (
        <CheckCircle size={16} />
      )}
      {message}
    </div>
  );
}
