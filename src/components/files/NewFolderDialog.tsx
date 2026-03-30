'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal, Input, Button } from '@/components/ui';
import { useFilesStore } from '@/stores/files';
import * as folderOps from '@/lib/db/folders';

const INVALID_CHARS = /[/\\:*?"<>|]/;

interface NewFolderDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NewFolderDialog({ open, onClose }: NewFolderDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentPath, refreshCurrentFolder } = useFilesStore();

  useEffect(() => {
    if (open) {
      setName('');
      setError('');
      // Focus input after modal animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function validate(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return 'Folder name cannot be empty';
    if (INVALID_CHARS.test(trimmed)) {
      return 'Name cannot contain / \\ : * ? " < > |';
    }
    return '';
  }

  async function handleCreate() {
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);
    try {
      await folderOps.createFolder(name.trim(), currentPath);
      await refreshCurrentFolder();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Folder">
      <div className="flex flex-col gap-4">
        <Input
          ref={inputRef}
          label="Folder name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          error={error}
          placeholder="Enter folder name"
          autoComplete="off"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={isCreating}>
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}
