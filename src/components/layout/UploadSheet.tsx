'use client';

import { useRef, useCallback } from 'react';
import {
  Upload,
  Image,
  FolderOpen,
  Camera,
  X,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface UploadSheetProps {
  open: boolean;
  onClose: () => void;
  onUpload?: (files: FileList) => void;
}

interface UploadOption {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accept?: string;
  capture?: string;
  directory?: boolean;
  mobileOnly?: boolean;
}

const UPLOAD_OPTIONS: UploadOption[] = [
  { label: 'Upload Files', icon: Upload, accept: '*/*' },
  { label: 'Upload Photos', icon: Image, accept: 'image/*' },
  { label: 'Upload Folder', icon: FolderOpen, directory: true },
  { label: 'Take Photo', icon: Camera, accept: 'image/*', capture: 'environment', mobileOnly: true },
];

export function UploadSheet({ open, onClose, onUpload }: UploadSheetProps) {
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeOptionRef = useRef<UploadOption | null>(null);

  const handleOptionClick = useCallback((option: UploadOption) => {
    const input = fileInputRef.current;
    if (!input) return;

    activeOptionRef.current = option;

    // Reset input
    input.value = '';
    input.removeAttribute('accept');
    input.removeAttribute('capture');
    input.removeAttribute('webkitdirectory');
    input.removeAttribute('multiple');

    if (option.accept) {
      input.setAttribute('accept', option.accept);
    }
    if (option.capture) {
      input.setAttribute('capture', option.capture);
    }
    if (option.directory) {
      input.setAttribute('webkitdirectory', '');
    }
    if (!option.capture) {
      input.setAttribute('multiple', '');
    }

    input.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && onUpload) {
        onUpload(files);
      }
      onClose();
    },
    [onUpload, onClose]
  );

  if (!open) return null;

  const visibleOptions = UPLOAD_OPTIONS.filter(
    (opt) => !opt.mobileOnly || isMobile
  );

  // Mobile: bottom sheet. Desktop: centered modal.
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* Sheet / Modal */}
      <div
        className={
          isMobile
            ? 'fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t'
            : 'fixed top-1/2 left-1/2 z-50 rounded-xl border'
        }
        style={{
          backgroundColor: 'var(--cn-bg-secondary)',
          borderColor: 'var(--cn-border)',
          ...(isMobile
            ? {
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                animation: 'cn-sheet-up 200ms ease-out',
              }
            : {
                transform: 'translate(-50%, -50%)',
                width: '100%',
                maxWidth: 400,
                animation: 'cn-modal-in 150ms ease-out',
              }),
        }}
        role="dialog"
        aria-label="Upload options"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 border-b"
          style={{
            height: 52,
            borderColor: 'var(--cn-border)',
          }}
        >
          {isMobile && (
            <div className="flex justify-center absolute left-0 right-0 top-2 pointer-events-none">
              <div
                className="rounded-full"
                style={{
                  width: 36,
                  height: 4,
                  backgroundColor: 'var(--cn-border)',
                }}
              />
            </div>
          )}
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--cn-text-primary)' }}
          >
            Upload
          </span>
          <button
            onClick={onClose}
            className="cn-interactive cn-focus-ring flex items-center justify-center rounded-full"
            style={{
              width: 36,
              height: 36,
              color: 'var(--cn-text-secondary)',
            }}
            aria-label="Close upload options"
          >
            <X size={20} />
          </button>
        </div>

        {/* Options */}
        <div className="py-2 px-2">
          {visibleOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option)}
                className="cn-interactive cn-focus-ring flex items-center gap-4 w-full px-4 rounded-lg text-left"
                style={{
                  height: 56,
                  minHeight: 48,
                  color: 'var(--cn-text-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: 'var(--cn-accent-glow)',
                    color: 'var(--cn-accent)',
                  }}
                >
                  <Icon size={20} />
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes cn-sheet-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes cn-modal-in {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}
