import { db } from './schema';
import type { CNCacheEntry } from '@/types';

export async function getCacheEntry(key: string): Promise<CNCacheEntry | undefined> {
  const entry = await db.cache.get(key);
  if (entry) {
    // Update access time for LRU
    await db.cache.update(key, { accessedAt: new Date() });
  }
  return entry;
}

export async function setCacheEntry(entry: CNCacheEntry): Promise<void> {
  await db.cache.put(entry);
}

export async function deleteCacheEntry(key: string): Promise<void> {
  await db.cache.delete(key);
}

export async function getCacheSize(): Promise<number> {
  const entries = await db.cache.toArray();
  return entries.reduce((sum, entry) => sum + entry.size, 0);
}

export async function evictLRU(targetSizeBytes: number): Promise<number> {
  const currentSize = await getCacheSize();
  if (currentSize <= targetSizeBytes) return 0;

  const bytesToFree = currentSize - targetSizeBytes;
  let bytesFreed = 0;

  // Get entries sorted by accessedAt (oldest first)
  const entries = await db.cache.orderBy('accessedAt').toArray();

  for (const entry of entries) {
    if (bytesFreed >= bytesToFree) break;

    await db.cache.delete(entry.key);
    bytesFreed += entry.size;
  }

  return bytesFreed;
}

export async function clearAllCache(): Promise<void> {
  await db.cache.clear();
}
