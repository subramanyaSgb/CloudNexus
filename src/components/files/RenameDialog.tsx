'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal, Input, Button } from '@/components/ui';
import { useFilesStore } from '@/stores/files';
import * as fileOps from '@/lib/db/files';
import * as folderOps from '@/lib/db/folders';

const INVALID_CHARS = /[/\\:*?"<>|]/;

interface RenameDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  currentName: string;
  itemType: 'file' | 'folder';
}

export function RenameDialog({ open, onClose, itemId, currentName, itemType }: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { refreshCurrentFolder } = useFilesStore();

  useEffect(() => {
    if (open) {
      setName(currentName);
      setError('');
      setTimeout(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          // Select filename without extension for files
          if (itemType === 'file') {
            const dotIndex = currentName.lastIndexOf('.');
            input.setSelectionRange(0, dotIndex > 0 ? dotIndex : currentName.length);
          } else {
            input.select();
          }
        }
      }, 50);
    }
  }, [open, currentName, itemType]);

  function validate(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return 'Name cannot be empty';
    if (INVALID_CHARS.test(trimmed)) {
      return 'Name cannot contain / \\ : * ? " < > |';
    }
    if (trimmed === currentName) return 'Name is unchanged';
    return '';
  }

  async function handleRename() {
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsRenaming(true);
    try {
      if (itemType === 'file') {
        await fileOps.updateFile(itemId, { name: name.trim() });
      } else {
        await folderOps.renameFolder(itemId, name.trim());
      }
      await refreshCurrentFolder();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename');
    } finally {
      setIsRenaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Rename ${itemType}`}>
      <div className="flex flex-col gap-4">
        <Input
          ref={inputRef}
          label="New name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          error={error}
          placeholder={`Enter new ${itemType} name`}
          autoComplete="off"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isRenaming}>
            Cancel
          </Button>
          <Button onClick={handleRename} loading={isRenaming}>
            Rename
          </Button>
        </div>
      </div>
    </Modal>
  );
}
