'use client';

import { useEffect, useCallback } from 'react';
import { useFilesStore } from '@/stores/files';

interface ShortcutHandlers {
  onDelete?: () => void;
  onRename?: () => void;
  onSelectAll?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onSearch?: () => void;
  onNavigateUp?: () => void;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const { selectAll, clearSelection } = useFilesStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input/textarea
      if (isEditableElement(e.target)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+A = select all
      if (ctrl && e.key === 'a') {
        e.preventDefault();
        if (handlers.onSelectAll) {
          handlers.onSelectAll();
        } else {
          selectAll();
        }
        return;
      }

      // Ctrl+C = copy
      if (ctrl && e.key === 'c') {
        e.preventDefault();
        handlers.onCopy?.();
        return;
      }

      // Ctrl+X = cut
      if (ctrl && e.key === 'x') {
        e.preventDefault();
        handlers.onCut?.();
        return;
      }

      // Ctrl+V = paste
      if (ctrl && e.key === 'v') {
        e.preventDefault();
        handlers.onPaste?.();
        return;
      }

      // Ctrl+F or "/" = focus search
      if ((ctrl && e.key === 'f') || e.key === '/') {
        e.preventDefault();
        handlers.onSearch?.();
        return;
      }

      // Delete = delete selected
      if (e.key === 'Delete') {
        e.preventDefault();
        handlers.onDelete?.();
        return;
      }

      // F2 = rename selected
      if (e.key === 'F2') {
        e.preventDefault();
        handlers.onRename?.();
        return;
      }

      // Backspace = navigate up one folder
      if (e.key === 'Backspace') {
        e.preventDefault();
        handlers.onNavigateUp?.();
        return;
      }

      // Escape = clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        return;
      }
    },
    [handlers, selectAll, clearSelection]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
