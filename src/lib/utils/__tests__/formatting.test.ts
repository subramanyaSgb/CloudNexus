import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  formatSpeed,
  formatDuration,
  formatETA,
} from '../formatting';

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(5242880)).toBe('5.0 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
  });

  it('formats terabytes', () => {
    expect(formatFileSize(1099511627776)).toBe('1.0 TB');
  });

  it('handles negative values', () => {
    expect(formatFileSize(-1)).toBe('Invalid');
  });
});

describe('formatSpeed', () => {
  it('formats speed with /s suffix', () => {
    expect(formatSpeed(1048576)).toBe('1.0 MB/s');
  });
});

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('0:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2:05');
  });

  it('formats hours, minutes, seconds', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('handles negative', () => {
    expect(formatDuration(-5)).toBe('0:00');
  });
});

describe('formatETA', () => {
  it('formats seconds', () => {
    expect(formatETA(30)).toBe('30s');
  });

  it('formats minutes', () => {
    expect(formatETA(120)).toBe('2m');
  });

  it('formats hours and minutes', () => {
    expect(formatETA(3700)).toBe('1h 2m');
  });

  it('handles Infinity', () => {
    expect(formatETA(Infinity)).toBe('--');
  });

  it('handles negative', () => {
    expect(formatETA(-1)).toBe('--');
  });
});
