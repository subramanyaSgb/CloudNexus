'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTransfersStore } from '@/stores/transfers';
import { useSettingsStore } from '@/stores/settings';
import { uploadFile } from '@/lib/telegram/upload';
import { downloadFile, downloadChunkedFile, triggerBrowserDownload } from '@/lib/telegram/download';
import { MAX_RETRY_COUNT, BACKOFF_BASE_MS, BACKOFF_MAX_MS } from '@/lib/utils/constants';
import type { CNTransfer, BucketType } from '@/types';

/**
 * Transfer engine hook that orchestrates the transfer queue.
 * Watches for queued transfers, starts them respecting concurrency limits,
 * handles pause/resume/cancel/retry, auto-resumes on network reconnect,
 * and sends browser notifications on completion.
 */
export function useTransferEngine() {
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const engineRunning = useRef(false);
  const processingRef = useRef(false);

  const {
    transfers,
    loadTransfers,
    updateProgress,
    setStatus,
  } = useTransfersStore();

  const concurrentTransfers = useSettingsStore((s) => s.concurrentTransfers);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted' ||
      document.visibilityState === 'visible'
    ) {
      return;
    }
    try {
      new Notification(title, { body, icon: '/icons/icon-192.png' });
    } catch {
      // Notification API may not be available
    }
  }, []);

  const executeTransfer = useCallback(
    async (transfer: CNTransfer) => {
      const controller = new AbortController();
      abortControllers.current.set(transfer.id, controller);

      try {
        await setStatus(transfer.id, 'transferring');

        if (transfer.type === 'upload') {
          // For uploads, we need a File object. The destination field stores the bucket.
          // The actual file data would be stored in a temporary cache or passed via a different mechanism.
          // This engine handles progress tracking; the file is assumed available.
          await uploadFile({
            file: new File([], transfer.fileName), // placeholder - actual file comes from upload initiator
            bucket: transfer.destination as BucketType,
            folder: '/',
            hash: '',
            onProgress: (progress) => {
              if (controller.signal.aborted) return;
              const bytesTransferred = Math.round((progress / 100) * transfer.fileSize);
              const speed = bytesTransferred > 0 ? bytesTransferred / ((Date.now() - (transfer.startedAt?.getTime() ?? Date.now())) / 1000) : 0;
              const currentChunk = transfer.totalChunks > 1
                ? Math.floor((progress / 100) * transfer.totalChunks)
                : 0;
              updateProgress(transfer.id, bytesTransferred, speed, currentChunk);
            },
          });
        } else {
          // Download
          const bucket = transfer.destination as BucketType;
          const fileId = transfer.fileId;

          if (!fileId) {
            throw new Error('No fileId for download');
          }

          // Simple single-chunk download via messageId
          // For chunked downloads, the fileId would be a JSON encoded structure
          let downloadedData: Buffer | Blob;

          if (transfer.totalChunks > 1) {
            // Parse chunk message IDs from fileId (stored as JSON array)
            const chunkMessageIds: number[] = JSON.parse(fileId);
            downloadedData = await downloadChunkedFile({
              bucket,
              chunkMessageIds,
              totalSize: transfer.fileSize,
              onProgress: (bytesDownloaded) => {
                if (controller.signal.aborted) return;
                const elapsed = (Date.now() - (transfer.startedAt?.getTime() ?? Date.now())) / 1000;
                const speed = elapsed > 0 ? bytesDownloaded / elapsed : 0;
                const currentChunk = transfer.totalChunks > 1
                  ? Math.floor((bytesDownloaded / transfer.fileSize) * transfer.totalChunks)
                  : 0;
                updateProgress(transfer.id, bytesDownloaded, speed, currentChunk);
              },
            });
          } else {
            const messageId = parseInt(fileId, 10);
            const buffer = await downloadFile({
              bucket,
              messageId,
              fileSize: transfer.fileSize,
              onProgress: (bytesDownloaded) => {
                if (controller.signal.aborted) return;
                const elapsed = (Date.now() - (transfer.startedAt?.getTime() ?? Date.now())) / 1000;
                const speed = elapsed > 0 ? bytesDownloaded / elapsed : 0;
                updateProgress(transfer.id, bytesDownloaded, speed, 0);
              },
            });
            downloadedData = buffer;
          }

          // Trigger browser download
          const blob = downloadedData instanceof Blob
            ? downloadedData
            : new Blob([new Uint8Array(downloadedData)]);
          triggerBrowserDownload(blob, transfer.fileName);
        }

        if (!controller.signal.aborted) {
          await setStatus(transfer.id, 'completed');
          sendNotification(
            `${transfer.type === 'upload' ? 'Upload' : 'Download'} Complete`,
            `${transfer.fileName} has finished.`
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        await setStatus(transfer.id, 'failed', message);
      } finally {
        abortControllers.current.delete(transfer.id);
      }
    },
    [setStatus, updateProgress, sendNotification]
  );

  // Process the queue: start queued transfers up to concurrency limit
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const store = useTransfersStore.getState();
      const currentTransfers = store.transfers;

      const activeCount = currentTransfers.filter(
        (t) => t.status === 'transferring' || t.status === 'preparing'
      ).length;

      const slotsAvailable = concurrentTransfers - activeCount;
      if (slotsAvailable <= 0) return;

      const queued = currentTransfers
        .filter((t) => t.status === 'queued')
        .sort((a, b) => {
          const prioOrder: Record<string, number> = { high: 0, normal: 1, low: 2 };
          const prioDiff = (prioOrder[a.priority] ?? 1) - (prioOrder[b.priority] ?? 1);
          if (prioDiff !== 0) return prioDiff;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

      const toStart = queued.slice(0, slotsAvailable);
      for (const transfer of toStart) {
        // Fire and forget - the transfer runs asynchronously
        executeTransfer(transfer);
      }
    } finally {
      processingRef.current = false;
    }
  }, [concurrentTransfers, executeTransfer]);

  // Watch transfers and process queue when state changes
  useEffect(() => {
    processQueue();
  }, [transfers, processQueue]);

  // Handle pause: abort the active transfer's controller
  useEffect(() => {
    for (const transfer of transfers) {
      if (transfer.status === 'paused' || transfer.status === 'cancelled') {
        const controller = abortControllers.current.get(transfer.id);
        if (controller) {
          controller.abort();
          abortControllers.current.delete(transfer.id);
        }
      }
    }
  }, [transfers]);

  // Auto-retry with exponential backoff
  useEffect(() => {
    const retryTimers: ReturnType<typeof setTimeout>[] = [];
    const store = useTransfersStore.getState();

    for (const transfer of transfers) {
      if (transfer.status === 'failed' && transfer.retryCount < MAX_RETRY_COUNT) {
        const backoffMs = Math.min(
          BACKOFF_BASE_MS * Math.pow(2, transfer.retryCount),
          BACKOFF_MAX_MS
        );
        const timer = setTimeout(() => {
          store.retryTransfer(transfer.id);
        }, backoffMs);
        retryTimers.push(timer);
      }
    }

    return () => {
      retryTimers.forEach(clearTimeout);
    };
  }, [transfers]);

  // Auto-resume on network reconnect
  useEffect(() => {
    const handleOnline = () => {
      const store = useTransfersStore.getState();
      const paused = store.transfers.filter((t) => t.status === 'paused');
      for (const transfer of paused) {
        store.resumeTransfer(transfer.id);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Load transfers on mount
  useEffect(() => {
    if (!engineRunning.current) {
      engineRunning.current = true;
      loadTransfers();
    }
  }, [loadTransfers]);

  // Expose pause/resume all
  const pauseAll = useCallback(() => {
    const store = useTransfersStore.getState();
    const active = store.transfers.filter(
      (t) => t.status === 'transferring' || t.status === 'preparing' || t.status === 'queued'
    );
    for (const t of active) {
      store.pauseTransfer(t.id);
    }
  }, []);

  const resumeAll = useCallback(() => {
    const store = useTransfersStore.getState();
    const paused = store.transfers.filter((t) => t.status === 'paused');
    for (const t of paused) {
      store.resumeTransfer(t.id);
    }
  }, []);

  return { pauseAll, resumeAll };
}
