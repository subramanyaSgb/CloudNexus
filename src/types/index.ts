// CloudNexus Type Definitions

export interface CNFile {
  id: string;
  name: string;
  folder: string;
  size: number;
  mime: string;
  hash: string;
  telegramChannelId: string;
  telegramMessageId: number;
  chunks: number;
  chunkMessageIds: number[];
  encrypted: boolean;
  encryptionIV?: string;
  tags: string[];
  starred: boolean;
  deleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date;
  uploadedAt: Date;
}

export interface CNFolder {
  id: string;
  name: string;
  path: string;
  parentPath: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CNTransfer {
  id: string;
  type: 'upload' | 'download';
  fileId?: string;
  fileName: string;
  fileSize: number;
  status: 'queued' | 'preparing' | 'transferring' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: 'high' | 'normal' | 'low';
  progress: number;
  bytesTransferred: number;
  speed: number;
  currentChunk: number;
  totalChunks: number;
  error?: string;
  retryCount: number;
  destination: string;
  encrypted: boolean;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CNMusicMeta {
  fileId: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: number;
  trackNumber: number;
  duration: number;
  albumArtCacheKey?: string;
  playCount: number;
  lastPlayedAt?: Date;
  lastPosition: number;
}

export interface CNVideoMeta {
  fileId: string;
  title: string;
  duration: number;
  resolution: string;
  codec?: string;
  thumbnailCacheKey?: string;
  lastPosition: number;
  lastPlayedAt?: Date;
  subtitleFileIds: string[];
}

export interface CNThumbnail {
  key: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: Date;
}

export interface CNCacheEntry {
  key: string;
  blob: Blob;
  rangeStart: number;
  rangeEnd: number;
  createdAt: Date;
  accessedAt: Date;
  size: number;
}

export interface CNSetting {
  key: string;
  value: string | number | boolean;
}

// Bucket channel names
export const BUCKET_CHANNELS = {
  files: 'CloudNexus Files',
  photos: 'CloudNexus Photos',
  videos: 'CloudNexus Videos',
  music: 'CloudNexus Music',
  vault: 'CloudNexus Vault',
  meta: 'CloudNexus Meta',
} as const;

export type BucketType = keyof typeof BUCKET_CHANNELS;

// Theme types
export type Theme = 'dark' | 'light' | 'system';

// Module types for navigation
export type AppModule = 'files' | 'gallery' | 'videos' | 'music' | 'transfers' | 'vault' | 'settings';

// Transfer chunk metadata for Telegram message captions
export interface CNTelegramCaption {
  cn: 1;
  name: string;
  folder: string;
  size: number;
  mime: string;
  hash: string;
  chunks: number;
  chunkIndex: number;
  encrypted: boolean;
  created: string;
  tags: string[];
  groupId?: string;
}
