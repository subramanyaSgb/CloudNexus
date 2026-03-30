import { Api } from 'telegram';
import { computeCheck } from 'telegram/Password';
import { getClient, createClient, getSessionString } from './client';
import { db } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';

const MODULE = 'TelegramAuth';

export interface AuthState {
  step: 'idle' | 'phone' | 'code' | 'password' | 'done' | 'error';
  phoneCodeHash?: string;
  error?: string;
}

export async function sendCode(phone: string): Promise<string> {
  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  logger.info(MODULE, 'Sending auth code to', phone);

  const result = await client.invoke(
    new Api.auth.SendCode({
      phoneNumber: phone,
      apiId: client.apiId,
      apiHash: client.apiHash,
      settings: new Api.CodeSettings({}),
    })
  );

  if (result instanceof Api.auth.SentCode) {
    return result.phoneCodeHash;
  }

  throw new Error('Unexpected response from SendCode');
}

export async function signIn(
  phone: string,
  code: string,
  phoneCodeHash: string
): Promise<boolean> {
  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  logger.info(MODULE, 'Signing in with code...');

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash,
        phoneCode: code,
      })
    );

    await saveSession();
    return true;
  } catch (err: unknown) {
    const error = err as { errorMessage?: string };
    if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
      logger.info(MODULE, '2FA required');
      return false; // Caller should ask for 2FA password
    }
    throw err;
  }
}

export async function signInWith2FA(password: string): Promise<void> {
  const client = getClient();
  if (!client) throw new Error('Client not initialized');

  logger.info(MODULE, 'Signing in with 2FA...');

  const passwordInfo = await client.invoke(new Api.account.GetPassword());

  const result = await client.invoke(
    new Api.auth.CheckPassword({
      password: await computeCheck(passwordInfo, password),
    })
  );

  if (result instanceof Api.auth.Authorization) {
    await saveSession();
    logger.info(MODULE, '2FA sign-in successful');
  } else {
    throw new Error('2FA authentication failed');
  }
}

export async function checkSession(): Promise<boolean> {
  try {
    const sessionSetting = await db.settings.get('telegramSession');
    if (!sessionSetting || typeof sessionSetting.value !== 'string' || !sessionSetting.value) {
      return false;
    }

    await createClient(sessionSetting.value);
    const client = getClient();
    if (!client) return false;

    // Validate the session by fetching self
    await client.invoke(new Api.users.GetFullUser({ id: new Api.InputUserSelf() }));
    logger.info(MODULE, 'Session valid');
    return true;
  } catch (err) {
    logger.warn(MODULE, 'Session invalid or expired', err);
    return false;
  }
}

export async function logout(): Promise<void> {
  const client = getClient();
  if (client) {
    try {
      await client.invoke(new Api.auth.LogOut());
    } catch {
      // Ignore errors during logout
    }
  }

  await db.settings.delete('telegramSession');
  await db.settings.delete('telegramApiId');
  await db.settings.delete('telegramApiHash');
  logger.info(MODULE, 'Logged out');
}

async function saveSession(): Promise<void> {
  const session = getSessionString();
  await db.settings.put({ key: 'telegramSession', value: session });
  logger.info(MODULE, 'Session saved');
}
