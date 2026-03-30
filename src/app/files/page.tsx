'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Info,
  Upload,
  X,
  FolderPlus,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useFilesStore } from '@/stores/files';
import { useUpload } from '@/hooks/useUpload';
import { FolderTree } from '@/components/files/FolderTree';
import { Breadcrumb } from '@/components/files/Breadcrumb';
import { FileGrid } from '@/components/files/FileGrid';
import { FileList } from '@/components/files/FileList';
import { FilePreview } from '@/components/files/FilePreview';
import { ContextMenu } from '@/components/files/ContextMenu';
import { FileViewer } from '@/components/files/FileViewer';
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

  const isMobile = useIsMobile();
  const { uploadFiles } = useUpload();
  const [showPreview, setShowPreview] = useState(false);
  const [viewingFile, setViewingFile] = useState<CNFile | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const dragCounter = useRef(0);
  const initialized = useRef(false);

  // Load files every time Files page is visited
  useEffect(() => {
    navigateTo(initialized.current ? useFilesStore.getState().currentPath : '/');
    initialized.current = true;
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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  // Open file for viewing
  const handleOpenFile = useCallback((file: CNFile) => {
    setViewingFile(file);
  }, []);

  // Context menu actions
  const handleOpen = () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'folder') {
      navigateTo((contextMenu.item as CNFolder).path);
    } else {
      setViewingFile(contextMenu.item as CNFile);
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
      {/* Left sidebar - Folder tree (hidden on mobile) */}
      {!isMobile && <FolderTree />}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isMobile ? '8px 10px' : '8px 16px',
            borderBottom: '1px solid var(--cn-border)',
            backgroundColor: 'var(--cn-bg-secondary)',
            flexWrap: 'wrap',
          }}
        >
          {/* Breadcrumb */}
          <div style={{ flex: 1, minWidth: isMobile ? '120px' : '200px' }}>
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
              minWidth: isMobile ? '0' : '180px',
              maxWidth: isMobile ? '100%' : '280px',
              flex: isMobile ? '1 1 100%' : undefined,
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
                width: isMobile ? '44px' : '32px',
                height: isMobile ? '44px' : '32px',
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
                width: isMobile ? '44px' : '32px',
                height: isMobile ? '44px' : '32px',
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

          {/* Info toggle — hidden on mobile */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              display: isMobile ? 'none' : 'inline-flex',
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
            <FileGrid onContextMenu={handleContextMenu} onOpenFile={handleOpenFile} />
          ) : (
            <FileList onContextMenu={handleContextMenu} onOpenFile={handleOpenFile} />
          )}
        </div>
      </div>

      {/* Right sidebar - File preview (hidden on mobile) */}
      {showPreview && !isMobile && <FilePreview onClose={() => setShowPreview(false)} />}

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

      {/* New Folder FAB — mobile only */}
      {isMobile && (
        <button
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--cn-accent)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--cn-shadow-lg)',
            cursor: 'pointer',
          }}
          aria-label="New folder"
          title="New folder"
        >
          <FolderPlus size={22} />
        </button>
      )}

      {/* File Viewer */}
      {viewingFile && (
        <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
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
