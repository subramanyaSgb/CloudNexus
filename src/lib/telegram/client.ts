import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { logger } from '@/lib/utils/logger';

const MODULE = 'TelegramClient';

let apiId: number | null = null;
let apiHash: string | null = null;
let clientInstance: TelegramClient | null = null;

export function setCredentials(id: number, hash: string): void {
  apiId = id;
  apiHash = hash;
}

export function getClient(): TelegramClient | null {
  return clientInstance;
}

export async function createClient(sessionString: string = ''): Promise<TelegramClient> {
  if (!apiId || !apiHash) {
    throw new Error('Telegram API credentials not set. Call setCredentials first.');
  }

  // If already connected, reuse
  if (clientInstance?.connected) {
    return clientInstance;
  }

  // If instance exists but disconnected, clean up
  if (clientInstance) {
    try {
      await clientInstance.disconnect();
    } catch {
      // ignore disconnect errors
    }
    clientInstance = null;
  }

  const session = new StringSession(sessionString);

  clientInstance = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    retryDelay: 1000,
    autoReconnect: true,
    useWSS: true,
    timeout: 30,
    deviceModel: 'CloudNexus PWA',
    appVersion: '1.0.0',
    systemVersion: navigator?.userAgent ?? 'Browser',
  });

  logger.info(MODULE, 'Connecting to Telegram...');

  try {
    await clientInstance.connect();
    logger.info(MODULE, 'Connected to Telegram');
  } catch (err) {
    logger.error(MODULE, 'Connection failed', err);
    clientInstance = null;
    throw new Error(
      'Failed to connect to Telegram. Check your internet connection and ensure Telegram is not blocked on your network.'
    );
  }

  return clientInstance;
}

export async function disconnectClient(): Promise<void> {
  if (clientInstance) {
    try {
      await clientInstance.disconnect();
    } catch {
      // ignore
    }
    clientInstance = null;
    logger.info(MODULE, 'Disconnected from Telegram');
  }
}

export function getSessionString(): string {
  if (!clientInstance) return '';
  return (clientInstance.session as StringSession).save();
}
