import { Api } from 'telegram';
import bigInt from 'big-integer';
import { getClient } from './client';
import { db } from '@/lib/db/schema';
import { BUCKET_CHANNELS, type BucketType } from '@/types';
import { logger } from '@/lib/utils/logger';

const MODULE = 'Channels';

interface ChannelInfo {
  id: string;
  accessHash: string;
  title: string;
}

export async function initializeBucketChannels(): Promise<Record<BucketType, ChannelInfo>> {
  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  logger.info(MODULE, 'Initializing bucket channels...');

  const channels: Record<string, ChannelInfo> = {} as Record<BucketType, ChannelInfo>;

  // First, try to find existing channels
  const existingChannels = await findExistingChannels();

  for (const [bucket, title] of Object.entries(BUCKET_CHANNELS)) {
    const existing = existingChannels.get(title);

    if (existing) {
      channels[bucket] = existing;
      logger.info(MODULE, `Found existing channel: ${title}`);
    } else {
      const created = await createBucketChannel(title);
      channels[bucket] = created;
      logger.info(MODULE, `Created channel: ${title}`);
    }

    // Save channel info to settings
    await db.settings.put({
      key: `channel_${bucket}`,
      value: JSON.stringify(channels[bucket]),
    });
  }

  logger.info(MODULE, 'All bucket channels ready');
  return channels as Record<BucketType, ChannelInfo>;
}

async function findExistingChannels(): Promise<Map<string, ChannelInfo>> {
  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  const result = new Map<string, ChannelInfo>();

  try {
    const dialogs = await client.invoke(
      new Api.messages.GetDialogs({
        offsetDate: 0,
        offsetId: 0,
        offsetPeer: new Api.InputPeerEmpty(),
        limit: 100,
        hash: bigInt(0),
      })
    );

    if (dialogs instanceof Api.messages.Dialogs || dialogs instanceof Api.messages.DialogsSlice) {
      for (const chat of dialogs.chats) {
        if (chat instanceof Api.Channel) {
          const title = chat.title;
          if (Object.values(BUCKET_CHANNELS).includes(title as (typeof BUCKET_CHANNELS)[BucketType])) {
            result.set(title, {
              id: chat.id.toString(),
              accessHash: chat.accessHash?.toString() ?? '',
              title,
            });
          }
        }
      }
    }
  } catch (err) {
    logger.error(MODULE, 'Error fetching existing channels', err);
  }

  return result;
}

async function createBucketChannel(title: string): Promise<ChannelInfo> {
  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  const result = await client.invoke(
    new Api.channels.CreateChannel({
      title,
      about: `CloudNexus storage bucket — ${title}`,
      broadcast: true,
      megagroup: false,
    })
  );

  if (result instanceof Api.Updates || result instanceof Api.UpdatesCombined) {
    for (const chat of result.chats) {
      if (chat instanceof Api.Channel && chat.title === title) {
        return {
          id: chat.id.toString(),
          accessHash: chat.accessHash?.toString() ?? '',
          title,
        };
      }
    }
  }

  throw new Error(`Failed to create channel: ${title}`);
}

export async function getChannelInfo(bucket: BucketType): Promise<ChannelInfo | null> {
  const setting = await db.settings.get(`channel_${bucket}`);
  if (!setting || typeof setting.value !== 'string') return null;

  try {
    return JSON.parse(setting.value) as ChannelInfo;
  } catch {
    return null;
  }
}

export async function getChannelInputPeer(bucket: BucketType): Promise<Api.InputPeerChannel | null> {
  const info = await getChannelInfo(bucket);
  if (!info) return null;

  return new Api.InputPeerChannel({
    channelId: bigInt(info.id),
    accessHash: bigInt(info.accessHash),
  });
}
