import Dexie, { type Table } from 'dexie';
import type {
  CNFile,
  CNFolder,
  CNTransfer,
  CNMusicMeta,
  CNVideoMeta,
  CNThumbnail,
  CNCacheEntry,
  CNSetting,
} from '@/types';

export class CloudNexusDB extends Dexie {
  files!: Table<CNFile, string>;
  folders!: Table<CNFolder, string>;
  transfers!: Table<CNTransfer, string>;
  musicMeta!: Table<CNMusicMeta, string>;
  videoMeta!: Table<CNVideoMeta, string>;
  thumbnails!: Table<CNThumbnail, string>;
  cache!: Table<CNCacheEntry, string>;
  settings!: Table<CNSetting, string>;

  constructor() {
    super('CloudNexusDB');

    this.version(1).stores({
      files:
        'id, name, folder, mime, hash, telegramMessageId, starred, deleted, createdAt, updatedAt, accessedAt, *tags',
      folders: 'id, path, parentPath',
      transfers: 'id, type, status, priority, createdAt',
      musicMeta:
        'fileId, title, artist, album, genre, year, playCount, lastPlayedAt',
      videoMeta: 'fileId, title, lastPlayedAt',
      thumbnails: 'key, createdAt',
      cache: 'key, createdAt, accessedAt, size',
      settings: 'key',
    });
  }
}

export const db = new CloudNexusDB();
