'use client';

import { useEffect } from 'react';
import { Lock, FolderOpen } from 'lucide-react';
import { useVaultStore } from '@/stores/vault';
import { VaultLockScreen } from '@/components/vault/VaultLockScreen';
import { useSettingsStore } from '@/stores/settings';
import { EmptyState, Button } from '@/components/ui';

export default function VaultPage() {
  const isUnlocked = useVaultStore((s) => s.isUnlocked);
  const initialize = useVaultStore((s) => s.initialize);
  const lock = useVaultStore((s) => s.lock);
  const resetAutoLock = useVaultStore((s) => s.resetAutoLock);
  const autoLockMinutes = useSettingsStore((s) => s.vaultAutoLockMinutes);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isUnlocked) {
      resetAutoLock(autoLockMinutes);
    }
  }, [isUnlocked, autoLockMinutes, resetAutoLock]);

  if (!isUnlocked) {
    return <VaultLockScreen />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Vault toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: 'var(--cn-border)' }}
      >
        <div className="flex items-center gap-2">
          <Lock size={18} style={{ color: 'var(--cn-vault)' }} />
          <span className="font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Vault
          </span>
          <span
            className="px-2 py-0.5 text-xs rounded-full"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: 'var(--cn-vault)',
            }}
          >
            Unlocked
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={lock}>
          <Lock size={14} />
          Lock
        </Button>
      </div>

      {/* Vault content — File Manager-style interface, to be fully built in Phase 8 */}
      <div className="flex-1 overflow-y-auto p-4">
        <EmptyState
          icon={FolderOpen}
          title="Vault is empty"
          description="Encrypted files you upload will appear here. Drag files into the vault or use the upload button to encrypt and store."
        />
      </div>
    </div>
  );
}
