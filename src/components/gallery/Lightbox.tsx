'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Star,
  Info,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { CNFile } from '@/types';
import { isVideo } from '@/lib/utils/mime';
import { formatFileSize, formatDate } from '@/lib/utils/formatting';

interface LightboxProps {
  open: boolean;
  files: CNFile[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleStar: (id: string) => void;
}

export function Lightbox({
  open,
  files,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onToggleStar,
}: LightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const file = files[currentIndex];

  const resetZoom = useCallback(() => setZoom(1), []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          resetZoom();
          break;
        case 'ArrowRight':
          onNext();
          resetZoom();
          break;
        case 'i':
          setShowInfo((v) => !v);
          break;
      }
    },
    [onClose, onPrev, onNext, resetZoom]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [open, handleKeyDown]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(5, z + (e.deltaY < 0 ? 0.25 : -0.25))));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(5, z + 0.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.5, z - 0.5));
  }, []);

  const handleImageClick = useCallback(() => {
    setZoom((z) => (z === 1 ? 2 : 1));
  }, []);

  if (!open || !file) return null;

  const isVideoFile = isVideo(file.mime);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: '#fff' }}>
            {currentIndex + 1} / {files.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LightboxButton
            icon={ZoomOut}
            label="Zoom out"
            onClick={handleZoomOut}
          />
          <span className="text-xs px-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <LightboxButton
            icon={ZoomIn}
            label="Zoom in"
            onClick={handleZoomIn}
          />
          <LightboxButton
            icon={Info}
            label="Info"
            onClick={() => setShowInfo((v) => !v)}
            active={showInfo}
          />
          <LightboxButton
            icon={Star}
            label="Star"
            onClick={() => onToggleStar(file.id)}
            active={file.starred}
          />
          <LightboxButton icon={Download} label="Download" onClick={() => {}} />
          <LightboxButton icon={X} label="Close" onClick={onClose} />
        </div>
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        onWheel={handleWheel}
      >
        {/* Prev button */}
        {hasPrev && (
          <button
            className="absolute left-4 z-10 p-2 rounded-full cn-interactive"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
              resetZoom();
            }}
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Image / Video */}
        <div
          className="flex items-center justify-center"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 150ms ease-out',
            maxWidth: '90vw',
            maxHeight: '80vh',
          }}
        >
          {isVideoFile ? (
            <div
              className="flex flex-col items-center justify-center gap-3"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <div
                className="w-32 h-32 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <span className="text-4xl">&#9654;</span>
              </div>
              <span className="text-sm">{file.name}</span>
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-lg overflow-hidden cursor-zoom-in"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                minWidth: '200px',
                minHeight: '200px',
                maxWidth: '90vw',
                maxHeight: '80vh',
              }}
              onClick={handleImageClick}
            >
              <div
                className="flex items-center justify-center p-8"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-2">&#128444;</div>
                  <p className="text-sm">{file.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next button */}
        {hasNext && (
          <button
            className="absolute right-4 z-10 p-2 rounded-full cn-interactive"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNext();
              resetZoom();
            }}
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Bottom info bar */}
      <div
        className="shrink-0 px-4 py-3 flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'rgba(255,255,255,0.8)',
        }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium" style={{ color: '#fff' }}>
            {file.name}
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {formatFileSize(file.size)} &middot; {formatDate(new Date(file.createdAt))}
          </span>
        </div>
        {file.starred && (
          <Star size={16} fill="var(--cn-accent)" style={{ color: 'var(--cn-accent)' }} />
        )}
      </div>

      {/* Info panel overlay */}
      {showInfo && (
        <div
          className="absolute right-0 top-14 bottom-14 w-72 overflow-y-auto p-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          }}
        >
          <h3 className="text-sm font-semibold mb-3">File Details</h3>
          <InfoRow label="Name" value={file.name} />
          <InfoRow label="Size" value={formatFileSize(file.size)} />
          <InfoRow label="Type" value={file.mime} />
          <InfoRow label="Created" value={formatDate(new Date(file.createdAt))} />
          <InfoRow label="Modified" value={formatDate(new Date(file.updatedAt))} />
          <InfoRow label="Folder" value={file.folder} />
          {file.tags.length > 0 && (
            <InfoRow label="Tags" value={file.tags.join(', ')} />
          )}
          <InfoRow label="Encrypted" value={file.encrypted ? 'Yes' : 'No'} />
          <InfoRow label="Chunks" value={String(file.chunks)} />
        </div>
      )}
    </div>
  );
}

function LightboxButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      className="p-2 rounded-md cn-interactive"
      style={{
        color: active ? 'var(--cn-accent)' : 'rgba(255,255,255,0.8)',
      }}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon size={18} />
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </span>
      <span className="text-xs text-right max-w-[180px] truncate">{value}</span>
    </div>
  );
}
