'use client';

import { useSettingsStore } from '@/stores/settings';
import { useAuthStore } from '@/stores/auth';
import { useVaultStore } from '@/stores/vault';
import { Button, Card } from '@/components/ui';
import {
  Sun,
  Moon,
  Monitor,
  Cloud,
  ArrowUpDown,
  Lock,
  HardDrive,
  Info,
  LogOut,
} from 'lucide-react';
import type { Theme } from '@/types';

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    concurrentTransfers,
    autoRetryCount,
    crossfadeDuration,
    gaplessPlayback,
    vaultAutoLockMinutes,
    cacheLimitMB,
    setSetting,
  } = useSettingsStore();
  const signOut = useAuthStore((s) => s.signOut);
  const isVaultSetup = useVaultStore((s) => s.isSetup);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--cn-text-primary)' }}>
        Settings
      </h1>

      {/* Telegram Account */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Cloud size={20} style={{ color: 'var(--cn-accent)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Telegram Account
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--cn-text-secondary)' }}>
          Connected to Telegram via MTProto. Your files are stored in private channels.
        </p>
        <Button variant="danger" size="sm" onClick={signOut}>
          <LogOut size={14} />
          Sign Out
        </Button>
      </Card>

      {/* Theme */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Sun size={20} style={{ color: 'var(--cn-accent)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Theme
          </h2>
        </div>
        <div className="flex gap-2">
          {([
            { value: 'dark' as Theme, label: 'Dark', icon: Moon },
            { value: 'light' as Theme, label: 'Light', icon: Sun },
            { value: 'system' as Theme, label: 'System', icon: Monitor },
          ]).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="cn-interactive cn-focus-ring flex items-center gap-2 px-4 py-2 rounded-md text-sm"
              style={{
                backgroundColor: theme === value ? 'var(--cn-accent-glow)' : 'var(--cn-bg-tertiary)',
                color: theme === value ? 'var(--cn-accent)' : 'var(--cn-text-secondary)',
                border: theme === value ? '1px solid var(--cn-accent)' : '1px solid var(--cn-border)',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* Transfer Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <ArrowUpDown size={20} style={{ color: 'var(--cn-accent)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Transfers
          </h2>
        </div>
        <div className="space-y-4">
          <SettingRow label="Concurrent Transfers" description="Maximum simultaneous transfers">
            <select
              value={concurrentTransfers}
              onChange={(e) => setSetting('concurrentTransfers', parseInt(e.target.value))}
              className="cn-focus-ring px-3 py-1.5 rounded-md text-sm"
              style={{
                backgroundColor: 'var(--cn-bg-tertiary)',
                color: 'var(--cn-text-primary)',
                border: '1px solid var(--cn-border)',
              }}
            >
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </SettingRow>
          <SettingRow label="Auto Retry" description="Times to retry failed transfers">
            <select
              value={autoRetryCount}
              onChange={(e) => setSetting('autoRetryCount', parseInt(e.target.value))}
              className="cn-focus-ring px-3 py-1.5 rounded-md text-sm"
              style={{
                backgroundColor: 'var(--cn-bg-tertiary)',
                color: 'var(--cn-text-primary)',
                border: '1px solid var(--cn-border)',
              }}
            >
              {[0, 1, 3, 5, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </SettingRow>
        </div>
      </Card>

      {/* Music Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Info size={20} style={{ color: 'var(--cn-accent)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Music
          </h2>
        </div>
        <div className="space-y-4">
          <SettingRow label="Gapless Playback" description="Preload next track for seamless transitions">
            <ToggleSwitch
              checked={gaplessPlayback}
              onChange={(v) => setSetting('gaplessPlayback', v)}
            />
          </SettingRow>
          <SettingRow label="Crossfade" description="Crossfade duration between tracks">
            <select
              value={crossfadeDuration}
              onChange={(e) => setSetting('crossfadeDuration', parseInt(e.target.value))}
              className="cn-focus-ring px-3 py-1.5 rounded-md text-sm"
              style={{
                backgroundColor: 'var(--cn-bg-tertiary)',
                color: 'var(--cn-text-primary)',
                border: '1px solid var(--cn-border)',
              }}
            >
              <option value={0}>Off</option>
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>{n}s</option>
              ))}
            </select>
          </SettingRow>
        </div>
      </Card>

      {/* Vault Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Lock size={20} style={{ color: 'var(--cn-vault)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Vault
          </h2>
        </div>
        <div className="space-y-4">
          <SettingRow
            label="Auto-Lock Timer"
            description={isVaultSetup ? 'Lock vault after inactivity' : 'Set up vault first'}
          >
            <select
              value={vaultAutoLockMinutes}
              onChange={(e) => setSetting('vaultAutoLockMinutes', parseInt(e.target.value))}
              disabled={!isVaultSetup}
              className="cn-focus-ring px-3 py-1.5 rounded-md text-sm"
              style={{
                backgroundColor: 'var(--cn-bg-tertiary)',
                color: 'var(--cn-text-primary)',
                border: '1px solid var(--cn-border)',
                opacity: isVaultSetup ? 1 : 0.5,
              }}
            >
              {[1, 5, 15, 30, 60].map((n) => (
                <option key={n} value={n}>{n} min</option>
              ))}
            </select>
          </SettingRow>
        </div>
      </Card>

      {/* Cache Settings */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <HardDrive size={20} style={{ color: 'var(--cn-accent)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Cache
          </h2>
        </div>
        <SettingRow label="Cache Limit" description="Maximum cache size for media and thumbnails">
          <select
            value={cacheLimitMB}
            onChange={(e) => setSetting('cacheLimitMB', parseInt(e.target.value))}
            className="cn-focus-ring px-3 py-1.5 rounded-md text-sm"
            style={{
              backgroundColor: 'var(--cn-bg-tertiary)',
              color: 'var(--cn-text-primary)',
              border: '1px solid var(--cn-border)',
            }}
          >
            {[256, 512, 1024, 2048, 4096].map((n) => (
              <option key={n} value={n}>{n >= 1024 ? `${n / 1024} GB` : `${n} MB`}</option>
            ))}
          </select>
        </SettingRow>
      </Card>

      {/* About */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Cloud size={20} style={{ color: 'var(--cn-accent)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            About
          </h2>
        </div>
        <div className="space-y-1">
          <p className="text-sm" style={{ color: 'var(--cn-text-primary)' }}>
            <strong>CloudNexus</strong> v1.0.0
          </p>
          <p className="text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
            Your Infinite Cloud. Your Command Center.
          </p>
          <p className="text-xs mt-2 cn-font-mono" style={{ color: 'var(--cn-text-secondary)' }}>
            Built with Next.js, GramJS, Dexie.js, Zustand
          </p>
        </div>
      </Card>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--cn-text-primary)' }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="cn-focus-ring relative inline-flex h-6 w-11 rounded-full transition-colors"
      style={{
        backgroundColor: checked ? 'var(--cn-accent)' : 'var(--cn-bg-tertiary)',
        border: `1px solid ${checked ? 'var(--cn-accent)' : 'var(--cn-border)'}`,
      }}
      role="switch"
      aria-checked={checked}
    >
      <span
        className="inline-block h-4 w-4 rounded-full transition-transform"
        style={{
          backgroundColor: '#FFFFFF',
          transform: checked ? 'translateX(22px)' : 'translateX(2px)',
          marginTop: '2px',
        }}
      />
    </button>
  );
}
