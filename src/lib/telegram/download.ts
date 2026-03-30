import { Api } from 'telegram';
import type bigInt from 'big-integer';
import { getClient } from './client';
import { getChannelInputPeer } from './channels';
import type { BucketType } from '@/types';
import { logger } from '@/lib/utils/logger';

const MODULE = 'Download';

export interface DownloadOptions {
  bucket: BucketType;
  messageId: number;
  fileSize: number;
  onProgress?: (bytesDownloaded: number) => void;
}

export interface ChunkedDownloadOptions {
  bucket: BucketType;
  chunkMessageIds: number[];
  totalSize: number;
  onProgress?: (bytesDownloaded: number) => void;
}

export async function downloadFile(options: DownloadOptions): Promise<Buffer> {
  const { bucket, messageId, onProgress } = options;

  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  const peer = await getChannelInputPeer(bucket);
  if (!peer) throw new Error(`Channel not found for bucket: ${bucket}`);

  logger.info(MODULE, `Downloading messageId=${messageId}`);

  // Get the message to access the media
  const messages = await client.invoke(
    new Api.channels.GetMessages({
      channel: peer,
      id: [new Api.InputMessageID({ id: messageId })],
    })
  );

  if (!(messages instanceof Api.messages.ChannelMessages) || messages.messages.length === 0) {
    throw new Error('Message not found');
  }

  const message = messages.messages[0];
  if (!(message instanceof Api.Message) || !message.media) {
    throw new Error('Message has no media');
  }

  let bytesDownloaded = 0;

  const progressCallback = onProgress
    ? (downloaded: bigInt.BigInteger) => {
        bytesDownloaded = downloaded.toJSNumber();
        onProgress(bytesDownloaded);
      }
    : undefined;

  const buffer = await client.downloadMedia(message, {
    progressCallback,
  });

  if (!buffer) {
    throw new Error('Download returned empty');
  }

  logger.info(MODULE, `Download complete: ${bytesDownloaded} bytes`);

  return Buffer.from(buffer as Buffer);
}

export async function downloadChunkedFile(options: ChunkedDownloadOptions): Promise<Blob> {
  const { bucket, chunkMessageIds, totalSize, onProgress } = options;

  logger.info(MODULE, `Chunked download: ${chunkMessageIds.length} chunks, ${totalSize} bytes`);

  const chunkBlobs: Blob[] = [];
  let totalBytesDownloaded = 0;

  for (let i = 0; i < chunkMessageIds.length; i++) {
    const chunkBuffer = await downloadFile({
      bucket,
      messageId: chunkMessageIds[i],
      fileSize: 0,
      onProgress: (bytes) => {
        onProgress?.(totalBytesDownloaded + bytes);
      },
    });

    chunkBlobs.push(new Blob([new Uint8Array(chunkBuffer) as BlobPart]));
    totalBytesDownloaded += chunkBuffer.length;

    logger.info(MODULE, `Chunk ${i + 1}/${chunkMessageIds.length} downloaded`);
  }

  return new Blob(chunkBlobs);
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
