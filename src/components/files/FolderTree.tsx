'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FolderOpen, FolderClosed, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { useFilesStore } from '@/stores/files';
import * as folderOps from '@/lib/db/folders';
import type { CNFolder } from '@/types';

interface FolderNodeProps {
  folder: CNFolder;
  level: number;
  currentPath: string;
  onNavigate: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, folder: CNFolder) => void;
}

function FolderNode({ folder, level, currentPath, onNavigate, onContextMenu }: FolderNodeProps) {
  const shouldAutoExpand = currentPath.startsWith(folder.path + '/') || currentPath === folder.path;
  const [manualExpanded, setManualExpanded] = useState(false);
  const expanded = manualExpanded || shouldAutoExpand;
  const setExpanded = setManualExpanded;
  const [children, setChildren] = useState<CNFolder[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const isActive = currentPath === folder.path;

  useEffect(() => {
    if (expanded && !hasLoaded) {
      folderOps.getChildFolders(folder.path).then((c) => {
        setChildren(c);
        setHasLoaded(true);
      });
    }
  }, [expanded, hasLoaded, folder.path]);

  // Refresh children when navigating into this folder
  useEffect(() => {
    if (expanded && hasLoaded) {
      folderOps.getChildFolders(folder.path).then(setChildren);
    }
  }, [currentPath, expanded, hasLoaded, folder.path]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleClick = () => {
    onNavigate(folder.path);
  };

  const FolderIcon = expanded ? FolderOpen : FolderClosed;

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, folder)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 8px',
          paddingLeft: `${level * 16 + 8}px`,
          cursor: 'pointer',
          borderRadius: 'var(--cn-radius-sm)',
          backgroundColor: isActive ? 'var(--cn-accent-glow)' : 'transparent',
          color: isActive ? 'var(--cn-accent)' : 'var(--cn-text-secondary)',
          transition: 'background-color var(--cn-transition-fast)',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--cn-bg-tertiary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <span
          onClick={handleToggle}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            transition: 'transform var(--cn-transition-fast)',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <ChevronRight size={14} />
        </span>
        <FolderIcon size={16} style={{ flexShrink: 0, color: folder.color || 'currentColor' }} />
        <span
          style={{
            fontSize: '13px',
            fontWeight: isActive ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {folder.name}
        </span>
      </div>
      {expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              level={level + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ContextMenuState {
  x: number;
  y: number;
  folder: CNFolder;
}

export function FolderTree() {
  const { currentPath, navigateTo, folders, refreshCurrentFolder } = useFilesStore();
  const [rootChildren, setRootChildren] = useState<CNFolder[]>([]);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [creating, setCreating] = useState<string | null>(null);
  const [createValue, setCreateValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    folderOps.getChildFolders('/').then(setRootChildren);
  }, [folders]);

  // Close context menu on outside click or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenu]);

  const handleContextMenu = useCallback((e: React.MouseEvent, folder: CNFolder) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, folder });
  }, []);

  const handleCreateSubfolder = async () => {
    if (!contextMenu) return;
    setCreating(contextMenu.folder.path);
    setCreateValue('');
    setContextMenu(null);
  };

  const handleRename = () => {
    if (!contextMenu) return;
    setRenaming(contextMenu.folder.id);
    setRenameValue(contextMenu.folder.name);
    setContextMenu(null);
  };

  const handleDelete = async () => {
    if (!contextMenu) return;
    await folderOps.deleteFolder(contextMenu.folder.id);
    setContextMenu(null);
    await refreshCurrentFolder();
    folderOps.getChildFolders('/').then(setRootChildren);
  };

  const submitRename = async (id: string) => {
    if (renameValue.trim()) {
      await folderOps.renameFolder(id, renameValue.trim());
      await refreshCurrentFolder();
      folderOps.getChildFolders('/').then(setRootChildren);
    }
    setRenaming(null);
  };

  const submitCreate = async (parentPath: string) => {
    if (createValue.trim()) {
      await folderOps.createFolder(createValue.trim(), parentPath);
      await refreshCurrentFolder();
      folderOps.getChildFolders('/').then(setRootChildren);
    }
    setCreating(null);
  };

  const isRootActive = currentPath === '/';

  return (
    <div
      style={{
        width: '240px',
        minWidth: '240px',
        height: '100%',
        borderRight: '1px solid var(--cn-border)',
        backgroundColor: 'var(--cn-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 12px 8px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--cn-text-secondary)',
        }}
      >
        Folders
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px 8px' }}>
        {/* Root folder */}
        <div
          onClick={() => navigateTo('/')}
          onContextMenu={(e) =>
            handleContextMenu(e, {
              id: '__root__',
              name: 'Root',
              path: '/',
              parentPath: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 8px',
            cursor: 'pointer',
            borderRadius: 'var(--cn-radius-sm)',
            backgroundColor: isRootActive ? 'var(--cn-accent-glow)' : 'transparent',
            color: isRootActive ? 'var(--cn-accent)' : 'var(--cn-text-secondary)',
            transition: 'background-color var(--cn-transition-fast)',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            if (!isRootActive) e.currentTarget.style.backgroundColor = 'var(--cn-bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            if (!isRootActive) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <FolderOpen size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: isRootActive ? 600 : 400 }}>/</span>
        </div>

        {/* Creating in root */}
        {creating === '/' && (
          <div style={{ padding: '4px 8px', paddingLeft: '24px' }}>
            <input
              autoFocus
              value={createValue}
              onChange={(e) => setCreateValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate('/');
                if (e.key === 'Escape') setCreating(null);
              }}
              onBlur={() => submitCreate('/')}
              placeholder="New folder name"
              style={{
                width: '100%',
                padding: '2px 6px',
                fontSize: '12px',
                backgroundColor: 'var(--cn-bg-tertiary)',
                color: 'var(--cn-text-primary)',
                border: '1px solid var(--cn-accent)',
                borderRadius: 'var(--cn-radius-sm)',
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Child folders */}
        {rootChildren.map((folder) =>
          renaming === folder.id ? (
            <div key={folder.id} style={{ padding: '4px 8px', paddingLeft: '24px' }}>
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename(folder.id);
                  if (e.key === 'Escape') setRenaming(null);
                }}
                onBlur={() => submitRename(folder.id)}
                style={{
                  width: '100%',
                  padding: '2px 6px',
                  fontSize: '12px',
                  backgroundColor: 'var(--cn-bg-tertiary)',
                  color: 'var(--cn-text-primary)',
                  border: '1px solid var(--cn-accent)',
                  borderRadius: 'var(--cn-radius-sm)',
                  outline: 'none',
                }}
              />
            </div>
          ) : (
            <FolderNode
              key={folder.id}
              folder={folder}
              level={1}
              currentPath={currentPath}
              onNavigate={navigateTo}
              onContextMenu={handleContextMenu}
            />
          )
        )}

        {/* Creating subfolder inline */}
        {creating && creating !== '/' && (
          <div style={{ padding: '4px 8px', paddingLeft: '40px' }}>
            <input
              autoFocus
              value={createValue}
              onChange={(e) => setCreateValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate(creating);
                if (e.key === 'Escape') setCreating(null);
              }}
              onBlur={() => submitCreate(creating)}
              placeholder="New folder name"
              style={{
                width: '100%',
                padding: '2px 6px',
                fontSize: '12px',
                backgroundColor: 'var(--cn-bg-tertiary)',
                color: 'var(--cn-text-primary)',
                border: '1px solid var(--cn-accent)',
                borderRadius: 'var(--cn-radius-sm)',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
            minWidth: '160px',
            backgroundColor: 'var(--cn-bg-secondary)',
            border: '1px solid var(--cn-border)',
            borderRadius: 'var(--cn-radius-md)',
            boxShadow: 'var(--cn-shadow-lg)',
            padding: '4px',
            overflow: 'hidden',
          }}
        >
          <ContextMenuItem icon={Plus} label="New subfolder" onClick={handleCreateSubfolder} />
          {contextMenu.folder.id !== '__root__' && (
            <>
              <ContextMenuItem icon={Pencil} label="Rename" onClick={handleRename} />
              <div style={{ height: '1px', backgroundColor: 'var(--cn-border)', margin: '4px 0' }} />
              <ContextMenuItem icon={Trash2} label="Delete" onClick={handleDelete} danger />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ContextMenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '6px 8px',
        fontSize: '13px',
        color: danger ? 'var(--cn-danger)' : 'var(--cn-text-primary)',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 'var(--cn-radius-sm)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--cn-bg-tertiary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
