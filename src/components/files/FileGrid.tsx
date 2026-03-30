'use client';

import {
  Image,
  Film,
  Music,
  FileText,
  Archive,
  File,
  FolderOpen,
  Star,
} from 'lucide-react';
import { useFilesStore } from '@/stores/files';
import { getFileCategory } from '@/lib/utils/mime';
import { formatFileSize, formatRelativeDate } from '@/lib/utils/formatting';
import { Spinner, EmptyState } from '@/components/ui';
import type { CNFile, CNFolder } from '@/types';

function getFileIcon(mime: string) {
  const category = getFileCategory(mime);
  switch (category) {
    case 'image': return Image;
    case 'video': return Film;
    case 'audio': return Music;
    case 'document': return FileText;
    case 'archive': return Archive;
    default: return File;
  }
}

interface FileGridProps {
  onContextMenu?: (e: React.MouseEvent, item: CNFile | CNFolder, type: 'file' | 'folder') => void;
}

export function FileGrid({ onContextMenu }: FileGridProps) {
  const { files, folders, selectedIds, toggleSelection, navigateTo, isLoading, sortBy, sortOrder } = useFilesStore();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (folders.length === 0 && files.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="This folder is empty"
        description="Upload files or create subfolders to get started."
      />
    );
  }

  const sortedFiles = [...files].sort((a, b) => {
    const mul = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') return mul * a.name.localeCompare(b.name);
    if (sortBy === 'size') return mul * (a.size - b.size);
    if (sortBy === 'mime') return mul * a.mime.localeCompare(b.mime);
    if (sortBy === 'createdAt') return mul * (a.createdAt.getTime() - b.createdAt.getTime());
    if (sortBy === 'updatedAt') return mul * (a.updatedAt.getTime() - b.updatedAt.getTime());
    return 0;
  });

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '12px',
        padding: '4px',
      }}
    >
      {/* Folders first */}
      {sortedFolders.map((folder) => {
        const isSelected = selectedIds.has(folder.id);
        return (
          <div
            key={folder.id}
            onClick={() => toggleSelection(folder.id)}
            onDoubleClick={() => navigateTo(folder.path)}
            onContextMenu={(e) => onContextMenu?.(e, folder, 'folder')}
            className="cn-panel"
            style={{
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: isSelected
                ? '1px solid var(--cn-accent)'
                : '1px solid var(--cn-border)',
              boxShadow: isSelected ? 'var(--cn-shadow-glow)' : 'none',
              transition: 'border-color var(--cn-transition-fast), box-shadow var(--cn-transition-fast)',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = 'var(--cn-text-secondary)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = 'var(--cn-border)';
            }}
          >
            <FolderOpen
              size={40}
              strokeWidth={1.5}
              style={{ color: folder.color || 'var(--cn-accent)', opacity: 0.85 }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--cn-text-primary)',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
              title={folder.name}
            >
              {folder.name}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--cn-text-secondary)' }}>Folder</span>
          </div>
        );
      })}

      {/* Files */}
      {sortedFiles.map((file) => {
        const isSelected = selectedIds.has(file.id);
        const FileIcon = getFileIcon(file.mime);
        return (
          <div
            key={file.id}
            onClick={() => toggleSelection(file.id)}
            onDoubleClick={() => {
              /* TODO: open/download */
            }}
            onContextMenu={(e) => onContextMenu?.(e, file, 'file')}
            className="cn-panel"
            style={{
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: isSelected
                ? '1px solid var(--cn-accent)'
                : '1px solid var(--cn-border)',
              boxShadow: isSelected ? 'var(--cn-shadow-glow)' : 'none',
              transition: 'border-color var(--cn-transition-fast), box-shadow var(--cn-transition-fast)',
              position: 'relative',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = 'var(--cn-text-secondary)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = 'var(--cn-border)';
            }}
          >
            {file.starred && (
              <Star
                size={12}
                fill="var(--cn-warning)"
                style={{
                  color: 'var(--cn-warning)',
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                }}
              />
            )}
            <div style={{ color: 'var(--cn-text-secondary)', opacity: 0.75 }}>
              <FileIcon size={36} strokeWidth={1.5} />
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--cn-text-primary)',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
              title={file.name}
            >
              {file.name}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--cn-text-secondary)' }}>
              {formatFileSize(file.size)}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--cn-text-secondary)', opacity: 0.7 }}>
              {formatRelativeDate(file.updatedAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
