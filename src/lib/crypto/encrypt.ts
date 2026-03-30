import { generateIV, arrayToBase64 } from './keys';

/**
 * Encrypt data using AES-256-GCM.
 * Returns { ciphertext, iv } where iv is base64-encoded.
 */
export async function encryptData(
  data: ArrayBuffer,
  key: CryptoKey
): Promise<{ ciphertext: ArrayBuffer; iv: string }> {
  const iv = generateIV();

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    data
  );

  return {
    ciphertext,
    iv: arrayToBase64(iv),
  };
}

/**
 * Encrypt a File object.
 * Returns an encrypted Blob and the IV.
 */
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encryptedBlob: Blob; iv: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const { ciphertext, iv } = await encryptData(arrayBuffer, key);

  return {
    encryptedBlob: new Blob([ciphertext], { type: 'application/octet-stream' }),
    iv,
  };
}
