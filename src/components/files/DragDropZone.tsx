'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface DragDropZoneProps {
  children: React.ReactNode;
  onDrop: (files: File[]) => void;
  className?: string;
}

export function DragDropZone({ children, onDrop, className = '' }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        onDrop(droppedFiles);
      }
    },
    [onDrop]
  );

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {/* Overlay */}
      <div
        className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 rounded-lg pointer-events-none"
        style={{
          backgroundColor: isDragging ? 'rgba(var(--cn-accent-rgb, 99, 102, 241), 0.12)' : 'transparent',
          border: isDragging ? '2px dashed var(--cn-accent)' : '2px dashed transparent',
          borderRadius: 'var(--cn-radius-lg)',
          opacity: isDragging ? 1 : 0,
          transition: 'opacity 200ms ease-out, background-color 200ms ease-out',
        }}
      >
        <div
          className="flex flex-col items-center gap-2 p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--cn-bg-secondary)',
            boxShadow: 'var(--cn-shadow-md)',
            transform: isDragging ? 'scale(1)' : 'scale(0.95)',
            opacity: isDragging ? 1 : 0,
            transition: 'transform 200ms ease-out, opacity 200ms ease-out',
          }}
        >
          <Upload size={32} style={{ color: 'var(--cn-accent)' }} />
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--cn-text-primary)' }}
          >
            Drop files to upload
          </span>
          <span className="text-xs" style={{ color: 'var(--cn-text-muted)' }}>
            Files will be uploaded to the current folder
          </span>
        </div>
      </div>
    </div>
  );
}
