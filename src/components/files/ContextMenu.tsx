'use client';

import { useEffect, useRef, useMemo } from 'react';
import {
  FolderOpen,
  Download,
  Pencil,
  FolderInput,
  Copy,
  Star,
  Trash2,
  Plus,
} from 'lucide-react';
import type { CNFile, CNFolder } from '@/types';

export interface ContextMenuAction {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick: () => void;
  danger?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  item: CNFile | CNFolder;
  type: 'file' | 'folder';
  onClose: () => void;
  onOpen?: () => void;
  onDownload?: () => void;
  onRename?: () => void;
  onMoveTo?: () => void;
  onCopy?: () => void;
  onStar?: () => void;
  onDelete?: () => void;
  onCreateSubfolder?: () => void;
}

export function ContextMenu({
  x,
  y,
  item,
  type,
  onClose,
  onOpen,
  onDownload,
  onRename,
  onMoveTo,
  onCopy,
  onStar,
  onDelete,
  onCreateSubfolder,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Compute position, adjusting to stay within viewport
  const position = useMemo(() => {
    const pos = { x, y };
    if (typeof window === 'undefined') return pos;
    // Estimate menu size (will refine on mount, but this avoids the effect)
    const menuWidth = 180;
    const menuHeight = 250;
    if (x + menuWidth > window.innerWidth) {
      pos.x = window.innerWidth - menuWidth - 8;
    }
    if (y + menuHeight > window.innerHeight) {
      pos.y = window.innerHeight - menuHeight - 8;
    }
    if (pos.x < 0) pos.x = 8;
    if (pos.y < 0) pos.y = 8;
    return pos;
  }, [x, y]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const isStarred = type === 'file' && 'starred' in item && (item as CNFile).starred;

  const fileActions: ContextMenuAction[] = [
    { label: 'Open', icon: FolderOpen, onClick: () => { onOpen?.(); onClose(); } },
    { label: 'Download', icon: Download, onClick: () => { onDownload?.(); onClose(); } },
    { label: 'Rename', icon: Pencil, onClick: () => { onRename?.(); onClose(); }, separator: true },
    { label: 'Move to...', icon: FolderInput, onClick: () => { onMoveTo?.(); onClose(); } },
    { label: 'Copy', icon: Copy, onClick: () => { onCopy?.(); onClose(); }, separator: true },
    { label: isStarred ? 'Unstar' : 'Star', icon: Star, onClick: () => { onStar?.(); onClose(); }, separator: true },
    { label: 'Delete', icon: Trash2, onClick: () => { onDelete?.(); onClose(); }, danger: true },
  ];

  const folderActions: ContextMenuAction[] = [
    { label: 'Open', icon: FolderOpen, onClick: () => { onOpen?.(); onClose(); } },
    { label: 'Rename', icon: Pencil, onClick: () => { onRename?.(); onClose(); }, separator: true },
    { label: 'Create subfolder', icon: Plus, onClick: () => { onCreateSubfolder?.(); onClose(); }, separator: true },
    { label: 'Delete', icon: Trash2, onClick: () => { onDelete?.(); onClose(); }, danger: true },
  ];

  const actions = type === 'file' ? fileActions : folderActions;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        minWidth: '180px',
        backgroundColor: 'var(--cn-bg-secondary)',
        border: '1px solid var(--cn-border)',
        borderRadius: 'var(--cn-radius-md)',
        boxShadow: 'var(--cn-shadow-lg)',
        padding: '4px',
        overflow: 'hidden',
      }}
    >
      {actions.map((action, index) => (
        <div key={action.label}>
          {index > 0 && actions[index - 1]?.separator && (
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--cn-border)',
                margin: '4px 0',
              }}
            />
          )}
          <button
            onClick={action.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '7px 10px',
              fontSize: '13px',
              color: action.danger ? 'var(--cn-danger)' : 'var(--cn-text-primary)',
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
            <action.icon size={14} />
            {action.label}
          </button>
        </div>
      ))}
    </div>
  );
}
