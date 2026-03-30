'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Film, Check } from 'lucide-react';
import type { CNFile } from '@/types';
import { isVideo } from '@/lib/utils/mime';
import { formatFileSize } from '@/lib/utils/formatting';
import { Skeleton } from '@/components/ui';

interface GalleryGridProps {
  files: CNFile[];
  selectedIds: Set<string>;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onOpen: (index: number) => void;
}

const PLACEHOLDER_COLORS: Record<string, string> = {
  'image/jpeg': '#2563eb',
  'image/png': '#7c3aed',
  'image/gif': '#059669',
  'image/webp': '#d97706',
  'image/svg+xml': '#dc2626',
  'image/bmp': '#0891b2',
  default: '#6366f1',
};

function getPlaceholderColor(mime: string): string {
  return PLACEHOLDER_COLORS[mime] ?? PLACEHOLDER_COLORS.default;
}

function GalleryThumbnail({
  file,
  index,
  selected,
  selectionMode,
  onSelect,
  onOpen,
}: {
  file: CNFile;
  index: number;
  selected: boolean;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onOpen: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVideoFile = isVideo(file.mime);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback(() => {
    if (selectionMode) {
      onSelect(file.id);
    } else {
      onOpen(index);
    }
  }, [selectionMode, file.id, index, onSelect, onOpen]);

  const handlePointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      onSelect(file.id);
    }, 500);
  }, [file.id, onSelect]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <div
      ref={ref}
      className="relative cursor-pointer group overflow-hidden"
      style={{
        borderRadius: 'var(--cn-radius-md)',
        border: selected ? '2px solid var(--cn-accent)' : '2px solid transparent',
        aspectRatio: '1',
      }}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {!visible ? (
        <Skeleton width="100%" height="100%" />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: getPlaceholderColor(file.mime) }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {file.name.split('.').pop()}
          </span>
        </div>
      )}

      {/* Video overlay */}
      {isVideoFile && visible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full p-2"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <Film size={20} style={{ color: '#fff' }} />
          </div>
        </div>
      )}

      {/* Selection checkbox */}
      {(selectionMode || selected) && (
        <div
          className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: selected ? 'var(--cn-accent)' : 'rgba(0,0,0,0.4)',
            border: selected ? 'none' : '2px solid rgba(255,255,255,0.7)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(file.id);
          }}
        >
          {selected && <Check size={14} style={{ color: '#fff' }} />}
        </div>
      )}

      {/* Hover info overlay */}
      <div
        className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        }}
      >
        <p
          className="text-xs truncate font-medium"
          style={{ color: '#fff' }}
        >
          {file.name}
        </p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
}

export function GalleryGrid({
  files,
  selectedIds,
  selectionMode,
  onSelect,
  onOpen,
}: GalleryGridProps) {
  return (
    <div
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '8px',
        padding: '8px',
      }}
    >
      {files.map((file, index) => (
        <GalleryThumbnail
          key={file.id}
          file={file}
          index={index}
          selected={selectedIds.has(file.id)}
          selectionMode={selectionMode}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
