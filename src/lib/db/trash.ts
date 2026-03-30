import { db } from './schema';
import { TRASH_PURGE_DAYS } from '@/lib/utils/constants';
import { logger } from '@/lib/utils/logger';

const MODULE = 'Trash';

/**
 * Purge files that have been in trash for more than TRASH_PURGE_DAYS.
 * Should be called on app startup and periodically.
 */
export async function purgeExpiredTrash(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - TRASH_PURGE_DAYS);

  const expiredFiles = await db.files
    .filter((f) => f.deleted && f.deletedAt !== undefined && f.deletedAt < cutoffDate)
    .toArray();

  if (expiredFiles.length === 0) return 0;

  for (const file of expiredFiles) {
    // Delete associated thumbnails
    await db.thumbnails.delete(file.id);
    // Delete associated cache entries
    await db.cache.where('key').startsWith(file.id).delete();
    // Delete the file record
    await db.files.delete(file.id);
  }

  logger.info(MODULE, `Purged ${expiredFiles.length} expired trash items`);
  return expiredFiles.length;
}

export async function getTrashFiles() {
  return db.files.filter((f) => f.deleted).toArray();
}

export async function emptyTrash(): Promise<number> {
  const trashFiles = await getTrashFiles();

  for (const file of trashFiles) {
    await db.thumbnails.delete(file.id);
    await db.cache.where('key').startsWith(file.id).delete();
    await db.files.delete(file.id);
  }

  logger.info(MODULE, `Emptied trash: ${trashFiles.length} files removed`);
  return trashFiles.length;
}

export async function getTrashSize(): Promise<{ count: number; totalSize: number }> {
  const trashFiles = await getTrashFiles();
  const totalSize = trashFiles.reduce((sum, f) => sum + f.size, 0);
  return { count: trashFiles.length, totalSize };
}
