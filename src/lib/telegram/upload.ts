import { Api } from 'telegram';
import { CustomFile } from 'telegram/client/uploads';
import { getClient } from './client';
import { getChannelInputPeer } from './channels';
import type { BucketType, CNTelegramCaption } from '@/types';
import { TELEGRAM_MAX_FILE_SIZE, TELEGRAM_CHUNK_SIZE } from '@/lib/utils/constants';
import { logger } from '@/lib/utils/logger';

const MODULE = 'Upload';

export interface UploadOptions {
  file: File;
  bucket: BucketType;
  folder: string;
  hash: string;
  tags?: string[];
  encrypted?: boolean;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  messageId: number;
  channelId: string;
  chunks: number;
  chunkMessageIds: number[];
}

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const { file, bucket, folder, hash, tags = [], encrypted = false, onProgress } = options;

  if (file.size > TELEGRAM_MAX_FILE_SIZE) {
    return uploadChunked(options);
  }

  return uploadSingle(file, bucket, folder, hash, tags, encrypted, onProgress);
}

async function uploadSingle(
  file: File,
  bucket: BucketType,
  folder: string,
  hash: string,
  tags: string[],
  encrypted: boolean,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  const peer = await getChannelInputPeer(bucket);
  if (!peer) throw new Error(`Channel not found for bucket: ${bucket}`);

  const caption: CNTelegramCaption = {
    cn: 1,
    name: file.name,
    folder,
    size: file.size,
    mime: file.type || 'application/octet-stream',
    hash,
    chunks: 1,
    chunkIndex: 0,
    encrypted,
    created: new Date().toISOString(),
    tags,
  };

  logger.info(MODULE, `Uploading ${file.name} (${file.size} bytes) to ${bucket}`);

  const buffer = Buffer.from(await file.arrayBuffer());
  const customFile = new CustomFile(file.name, file.size, '', buffer);

  const result = await client.sendFile(peer, {
    file: customFile,
    caption: JSON.stringify(caption),
    forceDocument: true,
    progressCallback: (progress: number) => {
      onProgress?.(Math.round(progress * 100));
    },
  });

  const messageId = result.id;
  const channelId = peer.channelId.toString();

  logger.info(MODULE, `Upload complete: messageId=${messageId}`);

  return {
    messageId,
    channelId,
    chunks: 1,
    chunkMessageIds: [messageId],
  };
}

async function uploadChunked(options: UploadOptions): Promise<UploadResult> {
  const { file, bucket, folder, hash, tags = [], encrypted = false, onProgress } = options;

  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  const peer = await getChannelInputPeer(bucket);
  if (!peer) throw new Error(`Channel not found for bucket: ${bucket}`);

  const totalChunks = Math.ceil(file.size / TELEGRAM_CHUNK_SIZE);
  const groupId = crypto.randomUUID();
  const chunkMessageIds: number[] = [];

  logger.info(MODULE, `Chunked upload: ${file.name} → ${totalChunks} chunks`);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * TELEGRAM_CHUNK_SIZE;
    const end = Math.min(start + TELEGRAM_CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const caption: CNTelegramCaption = {
      cn: 1,
      name: file.name,
      folder,
      size: file.size,
      mime: file.type || 'application/octet-stream',
      hash,
      chunks: totalChunks,
      chunkIndex: i,
      encrypted,
      created: new Date().toISOString(),
      tags,
      groupId,
    };

    const buffer = Buffer.from(await chunk.arrayBuffer());
    const chunkName = `${file.name}.part${i}`;
    const customFile = new CustomFile(chunkName, buffer.length, '', buffer);

    const result = await client.sendFile(peer, {
      file: customFile,
      caption: JSON.stringify(caption),
      forceDocument: true,
    });

    chunkMessageIds.push(result.id);

    const overallProgress = Math.round(((i + 1) / totalChunks) * 100);
    onProgress?.(overallProgress);

    logger.info(MODULE, `Chunk ${i + 1}/${totalChunks} uploaded (messageId=${result.id})`);
  }

  return {
    messageId: chunkMessageIds[0],
    channelId: peer.channelId.toString(),
    chunks: totalChunks,
    chunkMessageIds,
  };
}

export async function deleteUploadedFile(
  bucket: BucketType,
  messageIds: number[]
): Promise<void> {
  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  const peer = await getChannelInputPeer(bucket);
  if (!peer) throw new Error(`Channel not found for bucket: ${bucket}`);

  await client.invoke(
    new Api.channels.DeleteMessages({
      channel: peer,
      id: messageIds,
    })
  );

  logger.info(MODULE, `Deleted messages: ${messageIds.join(', ')}`);
}
