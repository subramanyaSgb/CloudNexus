import { db } from './schema';
import type { CNFolder } from '@/types';
import { generateId } from '@/lib/utils/id';

export async function createFolder(name: string, parentPath: string): Promise<CNFolder> {
  const path = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
  const now = new Date();

  const folder: CNFolder = {
    id: generateId(),
    name,
    path,
    parentPath,
    createdAt: now,
    updatedAt: now,
  };

  await db.folders.add(folder);
  return folder;
}

export async function getFolder(id: string): Promise<CNFolder | undefined> {
  return db.folders.get(id);
}

export async function getFolderByPath(path: string): Promise<CNFolder | undefined> {
  return db.folders.where('path').equals(path).first();
}

export async function getChildFolders(parentPath: string): Promise<CNFolder[]> {
  return db.folders.where('parentPath').equals(parentPath).toArray();
}

export async function renameFolder(id: string, newName: string): Promise<void> {
  const folder = await db.folders.get(id);
  if (!folder) return;

  const oldPath = folder.path;
  const newPath = folder.parentPath === '/' ? `/${newName}` : `${folder.parentPath}/${newName}`;

  // Update this folder
  await db.folders.update(id, {
    name: newName,
    path: newPath,
    updatedAt: new Date(),
  });

  // Update all child folders' paths
  const children = await db.folders
    .filter((f) => f.path.startsWith(oldPath + '/'))
    .toArray();

  for (const child of children) {
    const updatedPath = child.path.replace(oldPath, newPath);
    const updatedParentPath = child.parentPath.replace(oldPath, newPath);
    await db.folders.update(child.id, {
      path: updatedPath,
      parentPath: updatedParentPath,
      updatedAt: new Date(),
    });
  }

  // Update files in this folder and subfolders
  const files = await db.files
    .filter((f) => f.folder === oldPath || f.folder.startsWith(oldPath + '/'))
    .toArray();

  for (const file of files) {
    const updatedFolder = file.folder.replace(oldPath, newPath);
    await db.files.update(file.id, { folder: updatedFolder, updatedAt: new Date() });
  }
}

export async function deleteFolder(id: string): Promise<void> {
  const folder = await db.folders.get(id);
  if (!folder) return;

  // Delete all child folders
  const children = await db.folders
    .filter((f) => f.path.startsWith(folder.path + '/'))
    .toArray();

  for (const child of children) {
    await db.folders.delete(child.id);
  }

  // Soft-delete files in this folder tree
  const files = await db.files
    .filter((f) => f.folder === folder.path || f.folder.startsWith(folder.path + '/'))
    .toArray();

  for (const file of files) {
    await db.files.update(file.id, { deleted: true, deletedAt: new Date() });
  }

  // Delete the folder itself
  await db.folders.delete(id);
}

export async function moveFolder(id: string, newParentPath: string): Promise<void> {
  const folder = await db.folders.get(id);
  if (!folder) return;

  const oldPath = folder.path;
  const newPath = newParentPath === '/' ? `/${folder.name}` : `${newParentPath}/${folder.name}`;

  await db.folders.update(id, {
    path: newPath,
    parentPath: newParentPath,
    updatedAt: new Date(),
  });

  // Update children
  const children = await db.folders
    .filter((f) => f.path.startsWith(oldPath + '/'))
    .toArray();

  for (const child of children) {
    await db.folders.update(child.id, {
      path: child.path.replace(oldPath, newPath),
      parentPath: child.parentPath.replace(oldPath, newPath),
      updatedAt: new Date(),
    });
  }

  // Update files
  const files = await db.files
    .filter((f) => f.folder === oldPath || f.folder.startsWith(oldPath + '/'))
    .toArray();

  for (const file of files) {
    await db.files.update(file.id, {
      folder: file.folder.replace(oldPath, newPath),
      updatedAt: new Date(),
    });
  }
}

export async function ensureRootFolder(): Promise<void> {
  const root = await getFolderByPath('/');
  if (!root) {
    const now = new Date();
    await db.folders.add({
      id: generateId(),
      name: 'Root',
      path: '/',
      parentPath: '',
      createdAt: now,
      updatedAt: now,
    });
  }
}
