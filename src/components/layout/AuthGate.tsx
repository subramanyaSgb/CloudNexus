'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import { LoginFlow } from './LoginFlow';
import { AppShell } from './AppShell';
import { Spinner } from '@/components/ui/Spinner';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const step = useAuthStore((s) => s.step);
  const initAuth = useAuthStore((s) => s.initialize);
  const initSettings = useSettingsStore((s) => s.initialize);

  useEffect(() => {
    async function init() {
      await initSettings();
      await initAuth();
    }
    init();
  }, [initAuth, initSettings]);

  if (step === 'loading') {
    return (
      <div
        className="flex items-center justify-center h-dvh"
        style={{ backgroundColor: 'var(--cn-bg-primary)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Spinner size={40} />
          <p className="text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
            Initializing CloudNexus...
          </p>
        </div>
      </div>
    );
  }

  if (step !== 'authenticated') {
    return <LoginFlow />;
  }

  return <AppShell>{children}</AppShell>;
}
