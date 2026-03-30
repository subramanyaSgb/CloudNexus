import { create } from 'zustand';
import { setCredentials, createClient, disconnectClient } from '@/lib/telegram/client';
import { sendCode, signIn, signInWith2FA, checkSession, logout } from '@/lib/telegram/auth';
import { initializeBucketChannels } from '@/lib/telegram/channels';
import { db } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';

const MODULE = 'AuthStore';

type AuthStep = 'loading' | 'credentials' | 'phone' | 'code' | 'password' | 'authenticated' | 'error';

interface AuthStoreState {
  step: AuthStep;
  phone: string;
  phoneCodeHash: string;
  error: string | null;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  setApiCredentials: (apiId: number, apiHash: string) => Promise<void>;
  requestCode: (phone: string) => Promise<void>;
  submitCode: (code: string) => Promise<void>;
  submit2FA: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  step: 'loading',
  phone: '',
  phoneCodeHash: '',
  error: null,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      // Check for saved API credentials
      const apiIdSetting = await db.settings.get('telegramApiId');
      const apiHashSetting = await db.settings.get('telegramApiHash');

      if (
        !apiIdSetting ||
        !apiHashSetting ||
        typeof apiIdSetting.value !== 'number' ||
        typeof apiHashSetting.value !== 'string'
      ) {
        set({ step: 'credentials', isInitialized: true });
        return;
      }

      setCredentials(apiIdSetting.value as number, apiHashSetting.value as string);

      // Try to restore session
      const hasSession = await checkSession();

      if (hasSession) {
        // Initialize bucket channels
        try {
          await initializeBucketChannels();
        } catch (err) {
          logger.warn(MODULE, 'Failed to initialize channels on startup', err);
        }
        set({ step: 'authenticated', isInitialized: true });
      } else {
        // Ensure client is connected even without a valid session
        await createClient();
        set({ step: 'phone', isInitialized: true });
      }
    } catch (err) {
      logger.error(MODULE, 'Initialization failed', err);
      set({
        step: 'credentials',
        error: 'Failed to initialize. Please re-enter credentials.',
        isInitialized: true,
      });
    }
  },

  setApiCredentials: async (apiId: number, apiHash: string) => {
    try {
      setCredentials(apiId, apiHash);
      await db.settings.put({ key: 'telegramApiId', value: apiId });
      await db.settings.put({ key: 'telegramApiHash', value: apiHash });
      await createClient();
      set({ step: 'phone', error: null });
    } catch (err) {
      logger.error(MODULE, 'Failed to set credentials', err);
      const message = err instanceof Error ? err.message : 'Failed to connect';
      set({ error: message });
    }
  },

  requestCode: async (phone: string) => {
    try {
      set({ error: null });
      // Ensure client is connected before sending code
      const { getClient } = await import('@/lib/telegram/client');
      if (!getClient()) {
        await createClient();
      }
      const hash = await sendCode(phone);
      set({ step: 'code', phone, phoneCodeHash: hash });
    } catch (err) {
      logger.error(MODULE, 'Failed to send code', err);
      set({ error: 'Failed to send code. Check the phone number.' });
    }
  },

  submitCode: async (code: string) => {
    const { phone, phoneCodeHash } = get();
    try {
      set({ error: null });
      const success = await signIn(phone, code, phoneCodeHash);

      if (success) {
        await initializeBucketChannels();
        set({ step: 'authenticated' });
      } else {
        set({ step: 'password' });
      }
    } catch (err) {
      logger.error(MODULE, 'Failed to sign in', err);
      set({ error: 'Invalid code. Please try again.' });
    }
  },

  submit2FA: async (password: string) => {
    try {
      set({ error: null });
      await signInWith2FA(password);
      await initializeBucketChannels();
      set({ step: 'authenticated' });
    } catch (err) {
      logger.error(MODULE, '2FA failed', err);
      set({ error: 'Invalid password. Please try again.' });
    }
  },

  signOut: async () => {
    try {
      await logout();
      await disconnectClient();
      set({ step: 'phone', phone: '', phoneCodeHash: '', error: null });
    } catch (err) {
      logger.error(MODULE, 'Logout failed', err);
    }
  },

  clearError: () => set({ error: null }),
}));
