import { describe, it, expect } from 'vitest';
import {
  getMimeType,
  isImage,
  isVideo,
  isAudio,
  isDocument,
  getFileCategory,
} from '../mime';

describe('getMimeType', () => {
  it('detects image types', () => {
    expect(getMimeType('photo.jpg')).toBe('image/jpeg');
    expect(getMimeType('photo.png')).toBe('image/png');
    expect(getMimeType('photo.webp')).toBe('image/webp');
  });

  it('detects video types', () => {
    expect(getMimeType('video.mp4')).toBe('video/mp4');
    expect(getMimeType('video.mkv')).toBe('video/x-matroska');
  });

  it('detects audio types', () => {
    expect(getMimeType('song.mp3')).toBe('audio/mpeg');
    expect(getMimeType('song.flac')).toBe('audio/flac');
  });

  it('returns octet-stream for unknown', () => {
    expect(getMimeType('file.xyz')).toBe('application/octet-stream');
    expect(getMimeType('noextension')).toBe('application/octet-stream');
  });

  it('is case-insensitive on extension', () => {
    expect(getMimeType('photo.JPG')).toBe('image/jpeg');
  });
});

describe('file type checkers', () => {
  it('isImage', () => {
    expect(isImage('image/jpeg')).toBe(true);
    expect(isImage('video/mp4')).toBe(false);
  });

  it('isVideo', () => {
    expect(isVideo('video/mp4')).toBe(true);
    expect(isVideo('audio/mpeg')).toBe(false);
  });

  it('isAudio', () => {
    expect(isAudio('audio/mpeg')).toBe(true);
    expect(isAudio('image/png')).toBe(false);
  });

  it('isDocument', () => {
    expect(isDocument('application/pdf')).toBe(true);
    expect(isDocument('text/plain')).toBe(true);
    expect(isDocument('video/mp4')).toBe(false);
  });
});

describe('getFileCategory', () => {
  it('categorizes images', () => {
    expect(getFileCategory('image/png')).toBe('image');
  });

  it('categorizes videos', () => {
    expect(getFileCategory('video/mp4')).toBe('video');
  });

  it('categorizes audio', () => {
    expect(getFileCategory('audio/mpeg')).toBe('audio');
  });

  it('categorizes documents', () => {
    expect(getFileCategory('application/pdf')).toBe('document');
  });

  it('categorizes archives', () => {
    expect(getFileCategory('application/zip')).toBe('archive');
  });

  it('categorizes unknown as other', () => {
    expect(getFileCategory('application/octet-stream')).toBe('other');
  });
});
