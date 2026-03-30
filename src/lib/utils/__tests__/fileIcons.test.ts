import { describe, it, expect } from 'vitest';
import { getFileIconName, getFileCategoryColor } from '../fileIcons';

describe('getFileIconName', () => {
  it('returns Image for images', () => {
    expect(getFileIconName('image')).toBe('Image');
  });

  it('returns Video for videos', () => {
    expect(getFileIconName('video')).toBe('Video');
  });

  it('returns Music for audio', () => {
    expect(getFileIconName('audio')).toBe('Music');
  });

  it('returns FileText for documents', () => {
    expect(getFileIconName('document')).toBe('FileText');
  });

  it('returns Archive for archives', () => {
    expect(getFileIconName('archive')).toBe('Archive');
  });

  it('returns File for other', () => {
    expect(getFileIconName('other')).toBe('File');
  });
});

describe('getFileCategoryColor', () => {
  it('returns a color string for each category', () => {
    expect(getFileCategoryColor('image')).toMatch(/^#/);
    expect(getFileCategoryColor('video')).toMatch(/^#/);
    expect(getFileCategoryColor('audio')).toMatch(/^#/);
    expect(getFileCategoryColor('document')).toMatch(/^#/);
    expect(getFileCategoryColor('archive')).toMatch(/^#/);
    expect(getFileCategoryColor('other')).toMatch(/^#/);
  });

  it('returns different colors for different categories', () => {
    const colors = new Set([
      getFileCategoryColor('image'),
      getFileCategoryColor('video'),
      getFileCategoryColor('audio'),
      getFileCategoryColor('document'),
      getFileCategoryColor('archive'),
    ]);
    expect(colors.size).toBe(5);
  });
});
