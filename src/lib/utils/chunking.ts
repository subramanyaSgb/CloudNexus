import { TELEGRAM_CHUNK_SIZE, TELEGRAM_MAX_FILE_SIZE } from './constants';

export interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  size: number;
}

export function needsChunking(fileSize: number): boolean {
  return fileSize > TELEGRAM_MAX_FILE_SIZE;
}

export function calculateChunks(fileSize: number): ChunkInfo[] {
  if (fileSize <= TELEGRAM_MAX_FILE_SIZE) {
    return [{ index: 0, start: 0, end: fileSize, size: fileSize }];
  }

  const chunks: ChunkInfo[] = [];
  let offset = 0;
  let index = 0;

  while (offset < fileSize) {
    const end = Math.min(offset + TELEGRAM_CHUNK_SIZE, fileSize);
    chunks.push({
      index,
      start: offset,
      end,
      size: end - offset,
    });
    offset = end;
    index++;
  }

  return chunks;
}

export function getTotalChunks(fileSize: number): number {
  if (fileSize <= TELEGRAM_MAX_FILE_SIZE) return 1;
  return Math.ceil(fileSize / TELEGRAM_CHUNK_SIZE);
}
