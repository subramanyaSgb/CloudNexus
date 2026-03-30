'use client';

import {
  Image,
  Film,
  Music,
  FileText,
  Archive,
  File,
  Star,
  Download,
  Trash2,
  Calendar,
  HardDrive,
  Tag,
  FolderOpen,
  X,
} from 'lucide-react';
import { useFilesStore } from '@/stores/files';
import { getFileCategory, type FileCategory } from '@/lib/utils/mime';
import { formatFileSize, formatDate } from '@/lib/utils/formatting';
import { Button, Badge } from '@/components/ui';
import * as fileOps from '@/lib/db/files';
import type { CNFile } from '@/types';

function getCategoryIcon(category: FileCategory) {
  switch (category) {
    case 'image': return Image;
    case 'video': return Film;
    case 'audio': return Music;
    case 'document': return FileText;
    case 'archive': return Archive;
    default: return File;
  }
}

interface FilePreviewProps {
  onClose: () => void;
}

export function FilePreview({ onClose }: FilePreviewProps) {
  const { files, folders, selectedIds, refreshCurrentFolder } = useFilesStore();

  // Find selected file (only show preview for single file selection)
  const selectedId = selectedIds.size === 1 ? Array.from(selectedIds)[0] : null;
  const selectedFile = selectedId ? files.find((f) => f.id === selectedId) : null;
  const selectedFolder = selectedId ? folders.find((f) => f.id === selectedId) : null;

  const handleStar = async (file: CNFile) => {
    await fileOps.starFile(file.id, !file.starred);
    await refreshCurrentFolder();
  };

  const handleDelete = async (file: CNFile) => {
    await fileOps.softDeleteFile(file.id);
    await refreshCurrentFolder();
  };

  return (
    <div
      style={{
        width: '280px',
        minWidth: '280px',
        height: '100%',
        borderLeft: '1px solid var(--cn-border)',
        backgroundColor: 'var(--cn-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px',
          borderBottom: '1px solid var(--cn-border)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--cn-text-secondary)',
          }}
        >
          Details
        </span>
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: 'var(--cn-radius-sm)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--cn-text-secondary)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--cn-bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {!selectedFile && !selectedFolder ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '8px',
              color: 'var(--cn-text-secondary)',
              textAlign: 'center',
            }}
          >
            <File size={40} strokeWidth={1.5} style={{ opacity: 0.4 }} />
            <span style={{ fontSize: '13px' }}>Select a file to preview</span>
          </div>
        ) : selectedFolder ? (
          /* Folder preview */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <FolderOpen
              size={56}
              strokeWidth={1.5}
              style={{ color: selectedFolder.color || 'var(--cn-accent)', opacity: 0.85 }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--cn-text-primary)',
                textAlign: 'center',
                wordBreak: 'break-word',
              }}
            >
              {selectedFolder.name}
            </span>
            <div style={{ width: '100%', marginTop: '8px' }}>
              <DetailRow label="Path" value={selectedFolder.path} />
              <DetailRow label="Created" value={formatDate(selectedFolder.createdAt)} />
              <DetailRow label="Modified" value={formatDate(selectedFolder.updatedAt)} />
            </div>
          </div>
        ) : selectedFile ? (
          /* File preview */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {(() => {
              const category = getFileCategory(selectedFile.mime);
              const FileIcon = getCategoryIcon(category);
              return (
                <div style={{ color: 'var(--cn-text-secondary)', opacity: 0.7 }}>
                  <FileIcon size={56} strokeWidth={1.5} />
                </div>
              );
            })()}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--cn-text-primary)',
                textAlign: 'center',
                wordBreak: 'break-word',
              }}
            >
              {selectedFile.name}
            </span>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStar(selectedFile)}
                style={{ flex: 1 }}
              >
                <Star
                  size={14}
                  fill={selectedFile.starred ? 'var(--cn-warning)' : 'none'}
                  style={{ color: selectedFile.starred ? 'var(--cn-warning)' : 'currentColor' }}
                />
                {selectedFile.starred ? 'Unstar' : 'Star'}
              </Button>
              <Button variant="secondary" size="sm" style={{ flex: 1 }}>
                <Download size={14} />
                Download
              </Button>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(selectedFile)}
              style={{ width: '100%' }}
            >
              <Trash2 size={14} />
              Move to Trash
            </Button>

            {/* Details */}
            <div
              style={{
                width: '100%',
                marginTop: '8px',
                borderTop: '1px solid var(--cn-border)',
                paddingTop: '12px',
              }}
            >
              <DetailRow label="Size" value={formatFileSize(selectedFile.size)} icon={HardDrive} />
              <DetailRow label="Type" value={selectedFile.mime} />
              <DetailRow label="Folder" value={selectedFile.folder} icon={FolderOpen} />
              <DetailRow label="Created" value={formatDate(selectedFile.createdAt)} icon={Calendar} />
              <DetailRow label="Modified" value={formatDate(selectedFile.updatedAt)} />
              <DetailRow label="Accessed" value={formatDate(selectedFile.accessedAt)} />
              {selectedFile.encrypted && <DetailRow label="Encrypted" value="Yes" />}
            </div>

            {/* Tags */}
            {selectedFile.tags.length > 0 && (
              <div
                style={{
                  width: '100%',
                  borderTop: '1px solid var(--cn-border)',
                  paddingTop: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--cn-text-secondary)',
                  }}
                >
                  <Tag size={12} />
                  Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedFile.tags.map((tag) => (
                    <Badge key={tag} variant="accent">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '6px 0',
        gap: '8px',
      }}
    >
      <span
        style={{
          fontSize: '12px',
          color: 'var(--cn-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={12} />}
        {label}
      </span>
      <span
        style={{
          fontSize: '12px',
          color: 'var(--cn-text-primary)',
          textAlign: 'right',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </span>
    </div>
  );
}
