'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Info,
  Upload,
  X,
} from 'lucide-react';
import { useFilesStore } from '@/stores/files';
import { FolderTree } from '@/components/files/FolderTree';
import { Breadcrumb } from '@/components/files/Breadcrumb';
import { FileGrid } from '@/components/files/FileGrid';
import { FileList } from '@/components/files/FileList';
import { FilePreview } from '@/components/files/FilePreview';
import { ContextMenu } from '@/components/files/ContextMenu';
import * as fileOps from '@/lib/db/files';
import type { CNFile, CNFolder } from '@/types';

interface ContextMenuState {
  x: number;
  y: number;
  item: CNFile | CNFolder;
  type: 'file' | 'folder';
}

export default function FilesPage() {
  const {
    navigateTo,
    viewMode,
    setViewMode,
    searchQuery,
    search,
    clearSearch,
    refreshCurrentFolder,
  } = useFilesStore();

  const [showPreview, setShowPreview] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const dragCounter = useRef(0);
  const initialized = useRef(false);

  // Initialize on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      navigateTo('/');
    }
  }, [navigateTo]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: CNFile | CNFolder, type: 'file' | 'folder') => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, item, type });
    },
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (val.trim()) {
      search(val);
    } else {
      clearSearch();
    }
  };

  const clearSearchInput = () => {
    setSearchInput('');
    clearSearch();
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    // TODO: Handle file upload from dropped files
    // const files = Array.from(e.dataTransfer.files);
  };

  // Context menu actions
  const handleOpen = () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'folder') {
      navigateTo((contextMenu.item as CNFolder).path);
    }
  };

  const handleStar = async () => {
    if (!contextMenu || contextMenu.type !== 'file') return;
    const file = contextMenu.item as CNFile;
    await fileOps.starFile(file.id, !file.starred);
    await refreshCurrentFolder();
  };

  const handleDelete = async () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'file') {
      await fileOps.softDeleteFile(contextMenu.item.id);
    }
    await refreshCurrentFolder();
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: 'var(--cn-bg-primary)',
        position: 'relative',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Left sidebar - Folder tree */}
      <FolderTree />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderBottom: '1px solid var(--cn-border)',
            backgroundColor: 'var(--cn-bg-secondary)',
            flexWrap: 'wrap',
          }}
        >
          {/* Breadcrumb */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Breadcrumb />
          </div>

          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--cn-bg-tertiary)',
              border: '1px solid var(--cn-border)',
              borderRadius: 'var(--cn-radius-sm)',
              padding: '4px 8px',
              minWidth: '180px',
              maxWidth: '280px',
            }}
          >
            <Search size={14} style={{ color: 'var(--cn-text-secondary)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchInput}
              onChange={handleSearchChange}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: 'var(--cn-text-primary)',
                minWidth: 0,
              }}
            />
            {searchInput && (
              <button
                onClick={clearSearchInput}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--cn-text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              border: '1px solid var(--cn-border)',
              borderRadius: 'var(--cn-radius-sm)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? 'var(--cn-accent)' : 'var(--cn-bg-tertiary)',
                color: viewMode === 'grid' ? '#FFFFFF' : 'var(--cn-text-secondary)',
                transition: 'background-color var(--cn-transition-fast)',
              }}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                border: 'none',
                borderLeft: '1px solid var(--cn-border)',
                cursor: 'pointer',
                backgroundColor: viewMode === 'list' ? 'var(--cn-accent)' : 'var(--cn-bg-tertiary)',
                color: viewMode === 'list' ? '#FFFFFF' : 'var(--cn-text-secondary)',
                transition: 'background-color var(--cn-transition-fast)',
              }}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>

          {/* Info toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              border: '1px solid var(--cn-border)',
              borderRadius: 'var(--cn-radius-sm)',
              cursor: 'pointer',
              backgroundColor: showPreview ? 'var(--cn-accent)' : 'var(--cn-bg-tertiary)',
              color: showPreview ? '#FFFFFF' : 'var(--cn-text-secondary)',
              transition: 'background-color var(--cn-transition-fast)',
            }}
            title="Toggle file details"
          >
            <Info size={16} />
          </button>
        </div>

        {/* File content area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {searchQuery ? (
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--cn-text-secondary)' }}>
                Search results for &quot;{searchQuery}&quot;
              </span>
            </div>
          ) : null}
          {viewMode === 'grid' ? (
            <FileGrid onContextMenu={handleContextMenu} />
          ) : (
            <FileList onContextMenu={handleContextMenu} />
          )}
        </div>
      </div>

      {/* Right sidebar - File preview */}
      {showPreview && <FilePreview onClose={() => setShowPreview(false)} />}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          type={contextMenu.type}
          onClose={() => setContextMenu(null)}
          onOpen={handleOpen}
          onStar={handleStar}
          onDelete={handleDelete}
        />
      )}

      {/* Drag & drop overlay */}
      {isDragOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            pointerEvents: 'none',
            border: '3px dashed var(--cn-accent)',
            borderRadius: 'var(--cn-radius-lg)',
            margin: '8px',
          }}
        >
          <Upload size={48} style={{ color: 'var(--cn-accent)' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>
            Drop files to upload
          </span>
          <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Files will be uploaded to the current folder
          </span>
        </div>
      )}
    </div>
  );
}
