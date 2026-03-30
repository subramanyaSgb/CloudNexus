import { create } from 'zustand';
import { deriveKey, generateSalt, arrayToBase64, base64ToArray, validatePassphrase } from '@/lib/crypto/keys';
import { db } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';

const MODULE = 'VaultStore';

interface VaultState {
  isSetup: boolean;
  isUnlocked: boolean;
  masterKey: CryptoKey | null;
  autoLockTimer: ReturnType<typeof setTimeout> | null;

  // Actions
  initialize: () => Promise<void>;
  setupVault: (passphrase: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<boolean>;
  lock: () => void;
  changePassphrase: (currentPassphrase: string, newPassphrase: string) => Promise<boolean>;
  resetAutoLock: (minutes: number) => void;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  isSetup: false,
  isUnlocked: false,
  masterKey: null,
  autoLockTimer: null,

  initialize: async () => {
    const saltSetting = await db.settings.get('vaultSalt');
    set({ isSetup: !!saltSetting });
  },

  setupVault: async (passphrase: string) => {
    const validation = validatePassphrase(passphrase);
    if (!validation.valid) {
      throw new Error(validation.feedback);
    }

    const salt = generateSalt();
    const key = await deriveKey(passphrase, salt);

    // Store salt (not the key!)
    await db.settings.put({ key: 'vaultSalt', value: arrayToBase64(salt) });

    // Store a verification token — encrypt a known value
    const encoder = new TextEncoder();
    const verificationData = encoder.encode('CLOUDNEXUS_VAULT_VERIFY');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      verificationData as BufferSource
    );

    await db.settings.put({
      key: 'vaultVerification',
      value: arrayToBase64(new Uint8Array(iv)) + ':' + arrayToBase64(new Uint8Array(encrypted)),
    });

    set({ isSetup: true, isUnlocked: true, masterKey: key });
    logger.info(MODULE, 'Vault setup complete');
  },

  unlock: async (passphrase: string) => {
    const saltSetting = await db.settings.get('vaultSalt');
    if (!saltSetting || typeof saltSetting.value !== 'string') {
      throw new Error('Vault not set up');
    }

    const salt = base64ToArray(saltSetting.value);
    const key = await deriveKey(passphrase, salt);

    // Verify by decrypting the verification token
    const verificationSetting = await db.settings.get('vaultVerification');
    if (!verificationSetting || typeof verificationSetting.value !== 'string') {
      throw new Error('Vault verification data missing');
    }

    const [ivB64, encB64] = verificationSetting.value.split(':');
    const iv = base64ToArray(ivB64);
    const encrypted = base64ToArray(encB64);

    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        encrypted as BufferSource
      );

      const decoder = new TextDecoder();
      if (decoder.decode(decrypted) !== 'CLOUDNEXUS_VAULT_VERIFY') {
        return false;
      }

      set({ isUnlocked: true, masterKey: key });
      logger.info(MODULE, 'Vault unlocked');
      return true;
    } catch {
      logger.warn(MODULE, 'Vault unlock failed — wrong passphrase');
      return false;
    }
  },

  lock: () => {
    const { autoLockTimer } = get();
    if (autoLockTimer) clearTimeout(autoLockTimer);
    set({ isUnlocked: false, masterKey: null, autoLockTimer: null });
    logger.info(MODULE, 'Vault locked');
  },

  changePassphrase: async (currentPassphrase: string, newPassphrase: string) => {
    const { unlock, setupVault, lock } = get();

    // Verify current passphrase
    const isValid = await unlock(currentPassphrase);
    if (!isValid) return false;

    // Lock and re-setup with new passphrase
    lock();

    // Remove old salt and verification
    await db.settings.delete('vaultSalt');
    await db.settings.delete('vaultVerification');

    await setupVault(newPassphrase);
    return true;
  },

  resetAutoLock: (minutes: number) => {
    const { autoLockTimer, lock } = get();
    if (autoLockTimer) clearTimeout(autoLockTimer);

    if (minutes <= 0) return;

    const timer = setTimeout(() => {
      lock();
    }, minutes * 60 * 1000);

    set({ autoLockTimer: timer });
  },
}));
