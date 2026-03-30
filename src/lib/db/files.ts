import { db } from './schema';
import type { CNFile } from '@/types';
import { generateId } from '@/lib/utils/id';

export async function createFile(
  data: Omit<CNFile, 'id' | 'createdAt' | 'updatedAt' | 'accessedAt' | 'uploadedAt' | 'deleted' | 'deletedAt' | 'starred'>
): Promise<CNFile> {
  const now = new Date();
  const file: CNFile = {
    ...data,
    id: generateId(),
    starred: false,
    deleted: false,
    createdAt: now,
    updatedAt: now,
    accessedAt: now,
    uploadedAt: now,
  };

  await db.files.add(file);
  return file;
}

export async function getFile(id: string): Promise<CNFile | undefined> {
  return db.files.get(id);
}

export async function getFilesByFolder(folder: string): Promise<CNFile[]> {
  return db.files
    .where('folder')
    .equals(folder)
    .and((f) => !f.deleted)
    .toArray();
}

export async function updateFile(id: string, updates: Partial<CNFile>): Promise<void> {
  await db.files.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

export async function starFile(id: string, starred: boolean): Promise<void> {
  await updateFile(id, { starred });
}

export async function moveFile(id: string, newFolder: string): Promise<void> {
  await updateFile(id, { folder: newFolder });
}

export async function softDeleteFile(id: string): Promise<void> {
  await updateFile(id, { deleted: true, deletedAt: new Date() });
}

export async function restoreFile(id: string): Promise<void> {
  await updateFile(id, { deleted: false, deletedAt: undefined });
}

export async function permanentlyDeleteFile(id: string): Promise<void> {
  await db.files.delete(id);
}

export async function getDeletedFiles(): Promise<CNFile[]> {
  return db.files.where('deleted').equals(1).toArray();
}

export async function getStarredFiles(): Promise<CNFile[]> {
  return db.files
    .where('starred')
    .equals(1)
    .and((f) => !f.deleted)
    .toArray();
}

export async function getRecentFiles(limit: number = 20): Promise<CNFile[]> {
  return db.files
    .orderBy('accessedAt')
    .reverse()
    .filter((f) => !f.deleted)
    .limit(limit)
    .toArray();
}

export async function searchFiles(query: string): Promise<CNFile[]> {
  const lowerQuery = query.toLowerCase();
  return db.files
    .filter(
      (f) =>
        !f.deleted &&
        (f.name.toLowerCase().includes(lowerQuery) ||
          f.folder.toLowerCase().includes(lowerQuery) ||
          f.tags.some((t) => t.toLowerCase().includes(lowerQuery)))
    )
    .toArray();
}

export async function getFileByHash(hash: string): Promise<CNFile | undefined> {
  return db.files.where('hash').equals(hash).first();
}

export async function touchFile(id: string): Promise<void> {
  await db.files.update(id, { accessedAt: new Date() });
}
