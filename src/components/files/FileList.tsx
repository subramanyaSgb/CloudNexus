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
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useFilesStore } from '@/stores/files';
import { getFileCategory, type FileCategory } from '@/lib/utils/mime';
import { formatFileSize, formatRelativeDate } from '@/lib/utils/formatting';
import { Spinner, EmptyState } from '@/components/ui';
import type { CNFile, CNFolder } from '@/types';

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

type SortBy = 'name' | 'size' | 'createdAt' | 'updatedAt' | 'mime';

interface FileListProps {
  onContextMenu?: (e: React.MouseEvent, item: CNFile | CNFolder, type: 'file' | 'folder') => void;
}

export function FileList({ onContextMenu }: FileListProps) {
  const { files, folders, selectedIds, toggleSelection, navigateTo, isLoading, sortBy, sortOrder, setSorting } =
    useFilesStore();

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

  const handleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSorting(column, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSorting(column, 'asc');
    }
  };

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown;

  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === 'name') {
      return (sortOrder === 'asc' ? 1 : -1) * a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  const sortedFiles = [...files].sort((a, b) => {
    const mul = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') return mul * a.name.localeCompare(b.name);
    if (sortBy === 'size') return mul * (a.size - b.size);
    if (sortBy === 'mime') return mul * a.mime.localeCompare(b.mime);
    if (sortBy === 'createdAt') return mul * (a.createdAt.getTime() - b.createdAt.getTime());
    if (sortBy === 'updatedAt') return mul * (a.updatedAt.getTime() - b.updatedAt.getTime());
    return 0;
  });

  const headerStyle: React.CSSProperties = {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--cn-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--cn-border)' }}>
            <th style={{ ...headerStyle, width: '36px', cursor: 'default' }}>
              <input
                type="checkbox"
                checked={selectedIds.size === files.length + folders.length && selectedIds.size > 0}
                onChange={() => {
                  if (selectedIds.size === files.length + folders.length) {
                    useFilesStore.getState().clearSelection();
                  } else {
                    useFilesStore.getState().selectAll();
                  }
                }}
                style={{ accentColor: 'var(--cn-accent)' }}
              />
            </th>
            <th style={{ ...headerStyle, flex: 1 }} onClick={() => handleSort('name')}>
              Name {sortBy === 'name' && <SortIcon size={12} />}
            </th>
            <th style={{ ...headerStyle, width: '100px' }} onClick={() => handleSort('size')}>
              Size {sortBy === 'size' && <SortIcon size={12} />}
            </th>
            <th style={{ ...headerStyle, width: '140px' }} onClick={() => handleSort('updatedAt')}>
              Modified {sortBy === 'updatedAt' && <SortIcon size={12} />}
            </th>
            <th style={{ ...headerStyle, width: '100px' }} onClick={() => handleSort('mime')}>
              Type {sortBy === 'mime' && <SortIcon size={12} />}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Folders first */}
          {sortedFolders.map((folder) => {
            const isSelected = selectedIds.has(folder.id);
            return (
              <tr
                key={folder.id}
                onClick={() => toggleSelection(folder.id)}
                onDoubleClick={() => navigateTo(folder.path)}
                onContextMenu={(e) => onContextMenu?.(e, folder, 'folder')}
                style={{
                  backgroundColor: isSelected ? 'var(--cn-accent-glow)' : 'transparent',
                  borderBottom: '1px solid var(--cn-border)',
                  cursor: 'pointer',
                  transition: 'background-color var(--cn-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--cn-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = isSelected ? 'var(--cn-accent-glow)' : 'transparent';
                }}
              >
                <td style={{ padding: '8px 12px', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(folder.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: 'var(--cn-accent)' }}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderOpen size={18} style={{ color: folder.color || 'var(--cn-accent)', flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--cn-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {folder.name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--cn-text-secondary)' }}>--</td>
                <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--cn-text-secondary)' }}>
                  {formatRelativeDate(folder.updatedAt)}
                </td>
                <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--cn-text-secondary)' }}>Folder</td>
              </tr>
            );
          })}

          {/* Files */}
          {sortedFiles.map((file) => {
            const isSelected = selectedIds.has(file.id);
            const category = getFileCategory(file.mime);
            const FileIcon = getCategoryIcon(category);
            return (
              <tr
                key={file.id}
                onClick={() => toggleSelection(file.id)}
                onDoubleClick={() => {
                  /* TODO: open/download */
                }}
                onContextMenu={(e) => onContextMenu?.(e, file, 'file')}
                style={{
                  backgroundColor: isSelected ? 'var(--cn-accent-glow)' : 'transparent',
                  borderBottom: '1px solid var(--cn-border)',
                  cursor: 'pointer',
                  transition: 'background-color var(--cn-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--cn-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = isSelected ? 'var(--cn-accent-glow)' : 'transparent';
                }}
              >
                <td style={{ padding: '8px 12px', width: '36px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(file.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ accentColor: 'var(--cn-accent)' }}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--cn-text-secondary)', flexShrink: 0, display: 'inline-flex' }}>
                      <FileIcon size={18} />
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--cn-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name}
                    </span>
                    {file.starred && (
                      <Star size={12} fill="var(--cn-warning)" style={{ color: 'var(--cn-warning)', flexShrink: 0 }} />
                    )}
                  </div>
                </td>
                <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--cn-text-secondary)' }}>
                  {formatFileSize(file.size)}
                </td>
                <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--cn-text-secondary)' }}>
                  {formatRelativeDate(file.updatedAt)}
                </td>
                <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--cn-text-secondary)' }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
