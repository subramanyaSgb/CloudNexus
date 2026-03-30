'use client';

import { useState, useEffect } from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { db } from '@/lib/db/schema';
import { isImage, isVideo, isAudio } from '@/lib/utils/mime';
import { formatFileSize } from '@/lib/utils/formatting';
import type { CNFile } from '@/types';

interface FileViewerProps {
  file: CNFile;
  onClose: () => void;
}

export function FileViewer({ file, onClose }: FileViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url: string | null = null;

    async function loadFile() {
      setLoading(true);
      try {
        const cached = await db.cache.get(file.id);
        if (cached?.blob) {
          url = URL.createObjectURL(cached.blob);
          setBlobUrl(url);
        }
      } catch {
        // File not cached locally
      }
      setLoading(false);
    }

    loadFile();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    if (!blobUrl) return;
    window.open(blobUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ backgroundColor: 'var(--cn-bg-primary)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: 56,
          backgroundColor: 'var(--cn-bg-secondary)',
          borderBottom: '1px solid var(--cn-border)',
        }}
      >
        <div className="min-w-0 flex-1 mr-4">
          <p
            className="text-sm font-medium truncate"
            style={{ color: 'var(--cn-text-primary)' }}
          >
            {file.name}
          </p>
          <p className="text-xs cn-font-mono" style={{ color: 'var(--cn-text-secondary)' }}>
            {formatFileSize(file.size)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleOpenInNewTab}
            className="cn-interactive cn-focus-ring p-2 rounded-md"
            style={{ color: 'var(--cn-text-secondary)', minHeight: 44, minWidth: 44 }}
            title="Open in new tab"
          >
            <ExternalLink size={18} />
          </button>
          <button
            onClick={handleDownload}
            className="cn-interactive cn-focus-ring p-2 rounded-md"
            style={{ color: 'var(--cn-text-secondary)', minHeight: 44, minWidth: 44 }}
            title="Download"
          >
            <Download size={18} />
          </button>
          <button
            onClick={onClose}
            className="cn-interactive cn-focus-ring p-2 rounded-md"
            style={{ color: 'var(--cn-text-secondary)', minHeight: 44, minWidth: 44 }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="cn-skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
            <p className="text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
              Loading...
            </p>
          </div>
        ) : !blobUrl ? (
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <p className="text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
              File not available for preview.
            </p>
            <p className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
              The file data is stored on Telegram. Connect to Telegram to download and view it.
            </p>
          </div>
        ) : isImage(file.mime) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blobUrl}
            alt={file.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 'var(--cn-radius-lg)',
            }}
          />
        ) : isVideo(file.mime) ? (
          <video
            src={blobUrl}
            controls
            autoPlay
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: 'var(--cn-radius-lg)',
            }}
          />
        ) : isAudio(file.mime) ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <div
              className="w-32 h-32 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
            >
              <span className="text-4xl" style={{ color: 'var(--cn-accent)' }}>
                {file.name.split('.').pop()?.toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--cn-text-primary)' }}>
              {file.name}
            </p>
            <audio src={blobUrl} controls className="w-full" />
          </div>
        ) : file.mime === 'application/pdf' ? (
          <iframe
            src={blobUrl}
            title={file.name}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: 'var(--cn-radius-lg)',
            }}
          />
        ) : file.mime.startsWith('text/') ? (
          <TextPreview blobUrl={blobUrl} />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
            >
              <span className="text-lg cn-font-mono" style={{ color: 'var(--cn-text-secondary)' }}>
                {file.name.split('.').pop()?.toUpperCase() || '?'}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--cn-text-primary)' }}>
              {file.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
              Preview not available for this file type. Use download or open in new tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TextPreview({ blobUrl }: { blobUrl: string }) {
  const [text, setText] = useState<string>('');

  useEffect(() => {
    fetch(blobUrl)
      .then((r) => r.text())
      .then(setText);
  }, [blobUrl]);

  return (
    <pre
      className="w-full h-full overflow-auto p-4 text-sm cn-font-mono rounded-lg"
      style={{
        backgroundColor: 'var(--cn-bg-secondary)',
        color: 'var(--cn-text-primary)',
        border: '1px solid var(--cn-border)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {text}
    </pre>
  );
}
