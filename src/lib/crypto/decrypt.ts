import { base64ToArray } from './keys';

/**
 * Decrypt data using AES-256-GCM.
 */
export async function decryptData(
  ciphertext: ArrayBuffer,
  key: CryptoKey,
  ivBase64: string
): Promise<ArrayBuffer> {
  const iv = base64ToArray(ivBase64);

  return crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    ciphertext
  );
}

/**
 * Decrypt a Blob back to its original data.
 */
export async function decryptBlob(
  encryptedBlob: Blob,
  key: CryptoKey,
  ivBase64: string,
  originalMime: string
): Promise<Blob> {
  const arrayBuffer = await encryptedBlob.arrayBuffer();
  const decrypted = await decryptData(arrayBuffer, key, ivBase64);
  return new Blob([decrypted], { type: originalMime });
}
