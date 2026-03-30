'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { UploadSheet } from './UploadSheet';

interface UploadFABProps {
  onUpload?: (files: FileList) => void;
}

export function UploadFAB({ onUpload }: UploadFABProps) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  return (
    <>
      <button
        onClick={openSheet}
        className="cn-interactive cn-focus-ring fixed flex items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          right: isMobile ? 16 : 24,
          bottom: isMobile ? 80 : 24,
          backgroundColor: 'var(--cn-accent)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          boxShadow: '0 0 20px var(--cn-accent-glow), 0 4px 12px rgba(0, 0, 0, 0.3)',
          animation: 'cn-fab-pulse 3s ease-in-out infinite',
          transition: 'transform 150ms ease',
        }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)';
        }}
        onPointerUp={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
        onPointerLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
        aria-label="Upload file"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <UploadSheet
        open={sheetOpen}
        onClose={closeSheet}
        onUpload={onUpload}
      />

      {/* FAB pulse animation */}
      <style jsx global>{`
        @keyframes cn-fab-pulse {
          0%,
          100% {
            box-shadow: 0 0 20px var(--cn-accent-glow), 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 28px var(--cn-accent-glow), 0 4px 16px rgba(0, 0, 0, 0.35);
          }
        }
      `}</style>
    </>
  );
}
