'use client';

import { useState } from 'react';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { useVaultStore } from '@/stores/vault';
import { Button, Input } from '@/components/ui';

export function VaultLockScreen() {
  const isSetup = useVaultStore((s) => s.isSetup);
  const unlock = useVaultStore((s) => s.unlock);
  const setupVault = useVaultStore((s) => s.setupVault);

  if (!isSetup) {
    return <VaultSetup onSetup={setupVault} />;
  }

  return <VaultUnlock onUnlock={unlock} />;
}

function VaultSetup({ onSetup }: { onSetup: (passphrase: string) => Promise<void> }) {
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase !== confirm) {
      setError('Passphrases do not match');
      return;
    }
    if (passphrase.length < 12) {
      setError('Passphrase must be at least 12 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSetup(passphrase);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="cn-panel p-8 max-w-md w-full" style={{ boxShadow: 'var(--cn-shadow-glow)' }}>
        <div className="flex flex-col items-center mb-6">
          <div
            className="p-3 rounded-xl mb-4"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
          >
            <Shield size={32} style={{ color: 'var(--cn-vault)' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--cn-text-primary)' }}>
            Set Up Vault
          </h2>
          <p className="text-sm text-center mt-2" style={{ color: 'var(--cn-text-secondary)' }}>
            Create a passphrase to encrypt your sensitive files. This cannot be recovered.
          </p>
        </div>

        <div
          className="flex items-start gap-2 p-3 rounded-md mb-4"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <AlertTriangle size={16} style={{ color: 'var(--cn-warning)', flexShrink: 0, marginTop: 2 }} />
          <p className="text-xs" style={{ color: 'var(--cn-warning)' }}>
            There is no password recovery. If you forget your passphrase, your vault files will be permanently inaccessible.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm" style={{ color: 'var(--cn-danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Min 12 characters"
            required
          />
          <Input
            label="Confirm Passphrase"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter passphrase"
            required
          />
          <Button type="submit" loading={loading} disabled={!passphrase || !confirm}>
            <Lock size={16} />
            Create Vault
          </Button>
        </form>
      </div>
    </div>
  );
}

function VaultUnlock({ onUnlock }: { onUnlock: (passphrase: string) => Promise<boolean> }) {
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const success = await onUnlock(passphrase);
      if (!success) {
        setError('Incorrect passphrase');
        setPassphrase('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unlock failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="cn-panel p-8 max-w-md w-full" style={{ boxShadow: 'var(--cn-shadow-glow)' }}>
        <div className="flex flex-col items-center mb-6">
          <div
            className="p-3 rounded-xl mb-4"
            style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
          >
            <Lock size={32} style={{ color: 'var(--cn-vault)' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--cn-text-primary)' }}>
            Vault Locked
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--cn-text-secondary)' }}>
            Enter your passphrase to access encrypted files
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-center" style={{ color: 'var(--cn-danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter passphrase"
            autoFocus
            required
          />
          <Button type="submit" loading={loading} disabled={!passphrase}>
            <Lock size={16} />
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}
