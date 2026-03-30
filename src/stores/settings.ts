import { create } from 'zustand';
import { db } from '@/lib/db/schema';
import type { Theme } from '@/types';

interface SettingsState {
  theme: Theme;
  concurrentTransfers: number;
  speedThrottle: number;
  autoRetryCount: number;
  autoBackupPhotos: boolean;
  autoBackupVideos: boolean;
  crossfadeDuration: number;
  gaplessPlayback: boolean;
  vaultAutoLockMinutes: number;
  cacheLimitMB: number;
  thumbnailCacheLimitMB: number;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => Promise<void>;
}

const DEFAULT_SETTINGS: Omit<SettingsState, 'initialized' | 'initialize' | 'setTheme' | 'setSetting'> = {
  theme: 'system',
  concurrentTransfers: 3,
  speedThrottle: 0,
  autoRetryCount: 3,
  autoBackupPhotos: false,
  autoBackupVideos: false,
  crossfadeDuration: 0,
  gaplessPlayback: true,
  vaultAutoLockMinutes: 5,
  cacheLimitMB: 1024,
  thumbnailCacheLimitMB: 500,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    const settings = await db.settings.toArray();
    const updates: Partial<SettingsState> = {};

    for (const setting of settings) {
      if (setting.key in DEFAULT_SETTINGS) {
        (updates as Record<string, unknown>)[setting.key] = setting.value;
      }
    }

    set({ ...updates, initialized: true });
  },

  setTheme: async (theme: Theme) => {
    set({ theme });
    await db.settings.put({ key: 'theme', value: theme });
  },

  setSetting: async <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    set({ [key]: value } as Partial<SettingsState>);
    await db.settings.put({ key, value: value as string | number | boolean });
  },
}));
