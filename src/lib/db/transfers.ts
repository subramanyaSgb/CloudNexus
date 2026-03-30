import { db } from './schema';
import type { CNTransfer } from '@/types';
import { generateId } from '@/lib/utils/id';

export async function createTransfer(
  data: Omit<CNTransfer, 'id' | 'createdAt' | 'progress' | 'bytesTransferred' | 'speed' | 'currentChunk' | 'retryCount'>
): Promise<CNTransfer> {
  const transfer: CNTransfer = {
    ...data,
    id: generateId(),
    progress: 0,
    bytesTransferred: 0,
    speed: 0,
    currentChunk: 0,
    retryCount: 0,
    createdAt: new Date(),
  };

  await db.transfers.add(transfer);
  return transfer;
}

export async function getTransfer(id: string): Promise<CNTransfer | undefined> {
  return db.transfers.get(id);
}

export async function getTransfersByStatus(
  status: CNTransfer['status']
): Promise<CNTransfer[]> {
  return db.transfers.where('status').equals(status).toArray();
}

export async function getActiveTransfers(): Promise<CNTransfer[]> {
  return db.transfers
    .where('status')
    .anyOf(['queued', 'preparing', 'transferring'])
    .toArray();
}

export async function getCompletedTransfers(): Promise<CNTransfer[]> {
  return db.transfers
    .where('status')
    .equals('completed')
    .reverse()
    .toArray();
}

export async function getFailedTransfers(): Promise<CNTransfer[]> {
  return db.transfers.where('status').equals('failed').toArray();
}

export async function updateTransferProgress(
  id: string,
  bytesTransferred: number,
  speed: number,
  currentChunk: number
): Promise<void> {
  const transfer = await db.transfers.get(id);
  if (!transfer) return;

  const progress = transfer.fileSize > 0
    ? Math.min(100, Math.round((bytesTransferred / transfer.fileSize) * 100))
    : 0;

  await db.transfers.update(id, {
    bytesTransferred,
    speed,
    currentChunk,
    progress,
  });
}

export async function setTransferStatus(
  id: string,
  status: CNTransfer['status'],
  error?: string
): Promise<void> {
  const updates: Partial<CNTransfer> = { status };

  if (status === 'transferring') {
    updates.startedAt = new Date();
  } else if (status === 'completed') {
    updates.completedAt = new Date();
    updates.progress = 100;
  } else if (status === 'failed' && error) {
    updates.error = error;
  }

  await db.transfers.update(id, updates);
}

export async function incrementRetryCount(id: string): Promise<number> {
  const transfer = await db.transfers.get(id);
  if (!transfer) return 0;

  const newCount = transfer.retryCount + 1;
  await db.transfers.update(id, { retryCount: newCount });
  return newCount;
}

export async function clearCompletedTransfers(): Promise<void> {
  await db.transfers.where('status').equals('completed').delete();
}

export async function deleteTransfer(id: string): Promise<void> {
  await db.transfers.delete(id);
}
