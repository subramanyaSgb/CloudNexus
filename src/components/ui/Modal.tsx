'use client';

import { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = '480px' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="cn-panel w-full overflow-hidden"
        style={{
          maxWidth,
          backgroundColor: 'var(--cn-bg-tertiary)',
          boxShadow: 'var(--cn-shadow-lg)',
          animation: 'cn-fade-in 200ms ease-out',
        }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'var(--cn-border)' }}
          >
            <h2 className="text-lg font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="cn-interactive cn-focus-ring p-1 rounded-md"
              style={{ color: 'var(--cn-text-secondary)' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
