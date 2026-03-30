import { describe, it, expect } from 'vitest';
import { validatePassphrase, arrayToBase64, base64ToArray } from '../keys';

describe('validatePassphrase', () => {
  it('rejects short passphrases', () => {
    const result = validatePassphrase('short');
    expect(result.valid).toBe(false);
    expect(result.feedback).toContain('12 characters');
  });

  it('accepts passphrases 12+ characters', () => {
    const result = validatePassphrase('this is a valid pass');
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('gives higher score for complex passphrases', () => {
    const weak = validatePassphrase('simplesimple');
    const strong = validatePassphrase('C0mpl3x!Pass@Word#2026');
    expect(strong.score).toBeGreaterThan(weak.score);
  });
});

describe('arrayToBase64 / base64ToArray', () => {
  it('round-trips correctly', () => {
    const original = new Uint8Array([1, 2, 3, 4, 5, 255, 0, 128]);
    const b64 = arrayToBase64(original);
    const decoded = base64ToArray(b64);
    expect(decoded).toEqual(original);
  });

  it('handles empty array', () => {
    const empty = new Uint8Array(0);
    const b64 = arrayToBase64(empty);
    const decoded = base64ToArray(b64);
    expect(decoded).toEqual(empty);
  });
});
