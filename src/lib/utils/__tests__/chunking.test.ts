import { describe, it, expect } from 'vitest';
import { needsChunking, calculateChunks, getTotalChunks } from '../chunking';
import { TELEGRAM_MAX_FILE_SIZE, TELEGRAM_CHUNK_SIZE } from '../constants';

describe('needsChunking', () => {
  it('returns false for files under 2GB', () => {
    expect(needsChunking(1024)).toBe(false);
    expect(needsChunking(TELEGRAM_MAX_FILE_SIZE)).toBe(false);
  });

  it('returns true for files over 2GB', () => {
    expect(needsChunking(TELEGRAM_MAX_FILE_SIZE + 1)).toBe(true);
  });
});

describe('calculateChunks', () => {
  it('returns single chunk for small files', () => {
    const chunks = calculateChunks(1000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ index: 0, start: 0, end: 1000, size: 1000 });
  });

  it('returns single chunk for exactly 2GB', () => {
    const chunks = calculateChunks(TELEGRAM_MAX_FILE_SIZE);
    expect(chunks).toHaveLength(1);
  });

  it('splits large files into correct chunks', () => {
    const fileSize = TELEGRAM_CHUNK_SIZE * 2.5; // 2.5 chunks worth
    const chunks = calculateChunks(fileSize);

    expect(chunks).toHaveLength(3);
    expect(chunks[0].start).toBe(0);
    expect(chunks[0].end).toBe(TELEGRAM_CHUNK_SIZE);
    expect(chunks[1].start).toBe(TELEGRAM_CHUNK_SIZE);
    expect(chunks[1].end).toBe(TELEGRAM_CHUNK_SIZE * 2);
    expect(chunks[2].start).toBe(TELEGRAM_CHUNK_SIZE * 2);
    expect(chunks[2].end).toBe(fileSize);

    // Total size should equal file size
    const totalSize = chunks.reduce((sum, c) => sum + c.size, 0);
    expect(totalSize).toBe(fileSize);
  });
});

describe('getTotalChunks', () => {
  it('returns 1 for small files', () => {
    expect(getTotalChunks(1000)).toBe(1);
  });

  it('returns correct count for large files', () => {
    expect(getTotalChunks(TELEGRAM_CHUNK_SIZE * 3)).toBe(3);
  });
});
