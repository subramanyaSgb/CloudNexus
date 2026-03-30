'use client';

import { useCallback } from 'react';
import { useFilesStore } from '@/stores/files';
import { useTransfersStore } from '@/stores/transfers';
import * as fileOps from '@/lib/db/files';
import { getMimeType } from '@/lib/utils/mime';
import { generateId } from '@/lib/utils/id';
import { logger } from '@/lib/utils/logger';

const MODULE = 'Upload';

export function useUpload() {
  const currentPath = useFilesStore((s) => s.currentPath);
  const refreshCurrentFolder = useFilesStore((s) => s.refreshCurrentFolder);
  const addTransfer = useTransfersStore((s) => s.addTransfer);

  const uploadFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      logger.info(MODULE, `Uploading ${files.length} files to ${currentPath}`);

      for (const file of files) {
        const fileId = generateId();
        const mime = file.type || getMimeType(file.name);

        // 1. Create file record in local DB immediately (so it shows in file list)
        await fileOps.createFile({
          name: file.name,
          folder: currentPath,
          size: file.size,
          mime,
          hash: '', // Will be computed during actual upload
          telegramChannelId: '',
          telegramMessageId: 0,
          chunks: 1,
          chunkMessageIds: [],
          encrypted: false,
          tags: [],
        });

        // 2. Queue transfer
        await addTransfer({
          type: 'upload',
          fileId,
          fileName: file.name,
          fileSize: file.size,
          status: 'queued',
          priority: 'normal',
          totalChunks: 1,
          destination: currentPath,
          encrypted: false,
        });

        logger.info(MODULE, `Queued: ${file.name} (${file.size} bytes)`);
      }

      // 3. Refresh file list to show new files
      await refreshCurrentFolder();

      logger.info(MODULE, `${files.length} files queued for upload`);
    },
    [currentPath, refreshCurrentFolder, addTransfer]
  );

  return { uploadFiles };
}
