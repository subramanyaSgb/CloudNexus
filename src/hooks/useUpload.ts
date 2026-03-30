'use client';

import { useCallback, useState } from 'react';
import { useFilesStore } from '@/stores/files';
import { useTransfersStore } from '@/stores/transfers';
import * as fileOps from '@/lib/db/files';
import { getMimeType } from '@/lib/utils/mime';
import { logger } from '@/lib/utils/logger';

const MODULE = 'Upload';

export interface UploadState {
  isUploading: boolean;
  uploadedCount: number;
  totalCount: number;
  lastUploadedName: string;
}

export function useUpload() {
  const currentPath = useFilesStore((s) => s.currentPath);
  const refreshCurrentFolder = useFilesStore((s) => s.refreshCurrentFolder);
  const addTransfer = useTransfersStore((s) => s.addTransfer);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadedCount: 0,
    totalCount: 0,
    lastUploadedName: '',
  });

  const uploadFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      logger.info(MODULE, `Uploading ${files.length} files to ${currentPath}`);

      setUploadState({
        isUploading: true,
        uploadedCount: 0,
        totalCount: files.length,
        lastUploadedName: '',
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mime = file.type || getMimeType(file.name);

        try {
          // 1. Create file record in local DB
          const createdFile = await fileOps.createFile({
            name: file.name,
            folder: currentPath,
            size: file.size,
            mime,
            hash: '',
            telegramChannelId: '',
            telegramMessageId: 0,
            chunks: 1,
            chunkMessageIds: [],
            encrypted: false,
            tags: [],
          });

          // 2. Queue transfer with the CORRECT fileId
          await addTransfer({
            type: 'upload',
            fileId: createdFile.id,
            fileName: file.name,
            fileSize: file.size,
            status: 'queued',
            priority: 'normal',
            totalChunks: 1,
            destination: currentPath,
            encrypted: false,
          });

          setUploadState((prev) => ({
            ...prev,
            uploadedCount: i + 1,
            lastUploadedName: file.name,
          }));

          logger.info(MODULE, `Queued: ${file.name} (${file.size} bytes) id=${createdFile.id}`);
        } catch (err) {
          logger.error(MODULE, `Failed to queue ${file.name}`, err);
        }
      }

      // 3. Refresh file list
      await refreshCurrentFolder();

      // 4. Clear upload state after a delay (so user sees the toast)
      setTimeout(() => {
        setUploadState({
          isUploading: false,
          uploadedCount: 0,
          totalCount: 0,
          lastUploadedName: '',
        });
      }, 3000);

      logger.info(MODULE, `${files.length} files queued for upload`);
    },
    [currentPath, refreshCurrentFolder, addTransfer]
  );

  return { uploadFiles, uploadState };
}
