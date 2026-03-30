'use client';

import { useCallback } from 'react';
import { useFilesStore } from '@/stores/files';
import * as fileOps from '@/lib/db/files';
import * as folderOps from '@/lib/db/folders';
import { logger } from '@/lib/utils/logger';

const MODULE = 'FileOperations';

export function useFileOperations() {
  const refreshCurrentFolder = useFilesStore((s) => s.refreshCurrentFolder);
  const currentPath = useFilesStore((s) => s.currentPath);
  const clearSelection = useFilesStore((s) => s.clearSelection);

  const createFolder = useCallback(
    async (name: string) => {
      try {
        await folderOps.createFolder(name, currentPath);
        await refreshCurrentFolder();
        logger.info(MODULE, `Created folder: ${name} in ${currentPath}`);
      } catch (err) {
        logger.error(MODULE, 'Failed to create folder', err);
        throw err;
      }
    },
    [currentPath, refreshCurrentFolder]
  );

  const renameFile = useCallback(
    async (id: string, newName: string) => {
      try {
        await fileOps.updateFile(id, { name: newName });
        await refreshCurrentFolder();
        logger.info(MODULE, `Renamed file: ${id} to ${newName}`);
      } catch (err) {
        logger.error(MODULE, 'Failed to rename file', err);
        throw err;
      }
    },
    [refreshCurrentFolder]
  );

  const renameFolder = useCallback(
    async (id: string, newName: string) => {
      try {
        await folderOps.renameFolder(id, newName);
        await refreshCurrentFolder();
        logger.info(MODULE, `Renamed folder: ${id} to ${newName}`);
      } catch (err) {
        logger.error(MODULE, 'Failed to rename folder', err);
        throw err;
      }
    },
    [refreshCurrentFolder]
  );

  const deleteFiles = useCallback(
    async (fileIds: string[]) => {
      try {
        for (const id of fileIds) {
          await fileOps.softDeleteFile(id);
        }
        clearSelection();
        await refreshCurrentFolder();
        logger.info(MODULE, `Deleted ${fileIds.length} files`);
      } catch (err) {
        logger.error(MODULE, 'Failed to delete files', err);
        throw err;
      }
    },
    [clearSelection, refreshCurrentFolder]
  );

  const deleteFolders = useCallback(
    async (folderIds: string[]) => {
      try {
        for (const id of folderIds) {
          await folderOps.deleteFolder(id);
        }
        clearSelection();
        await refreshCurrentFolder();
        logger.info(MODULE, `Deleted ${folderIds.length} folders`);
      } catch (err) {
        logger.error(MODULE, 'Failed to delete folders', err);
        throw err;
      }
    },
    [clearSelection, refreshCurrentFolder]
  );

  const starFile = useCallback(
    async (id: string, starred: boolean) => {
      try {
        await fileOps.starFile(id, starred);
        await refreshCurrentFolder();
      } catch (err) {
        logger.error(MODULE, 'Failed to star file', err);
        throw err;
      }
    },
    [refreshCurrentFolder]
  );

  const moveFiles = useCallback(
    async (fileIds: string[], targetFolder: string) => {
      try {
        for (const id of fileIds) {
          await fileOps.moveFile(id, targetFolder);
        }
        clearSelection();
        await refreshCurrentFolder();
        logger.info(MODULE, `Moved ${fileIds.length} files to ${targetFolder}`);
      } catch (err) {
        logger.error(MODULE, 'Failed to move files', err);
        throw err;
      }
    },
    [clearSelection, refreshCurrentFolder]
  );

  return {
    createFolder,
    renameFile,
    renameFolder,
    deleteFiles,
    deleteFolders,
    starFile,
    moveFiles,
  };
}
