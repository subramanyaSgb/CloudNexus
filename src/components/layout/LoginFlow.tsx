'use client';

import { useState } from 'react';
import { Cloud, ArrowRight, KeyRound, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginFlow() {
  const step = useAuthStore((s) => s.step);
  const error = useAuthStore((s) => s.error);
  const setApiCredentials = useAuthStore((s) => s.setApiCredentials);
  const requestCode = useAuthStore((s) => s.requestCode);
  const submitCode = useAuthStore((s) => s.submitCode);
  const submit2FA = useAuthStore((s) => s.submit2FA);
  const clearError = useAuthStore((s) => s.clearError);

  return (
    <div
      className="flex items-center justify-center min-h-dvh p-4"
      style={{ backgroundColor: 'var(--cn-bg-primary)' }}
    >
      <div
        className="w-full max-w-md cn-panel p-8"
        style={{
          boxShadow: 'var(--cn-shadow-glow)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="p-3 rounded-xl mb-4"
            style={{
              backgroundColor: 'var(--cn-accent-glow)',
              boxShadow: 'var(--cn-shadow-glow)',
            }}
          >
            <Cloud size={32} style={{ color: 'var(--cn-accent)' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--cn-text-primary)' }}>
            CloudNexus
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cn-text-secondary)' }}>
            Your Infinite Cloud. Your Command Center.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-md text-sm"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--cn-danger)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </div>
        )}

        {/* Steps */}
        {step === 'credentials' && (
          <CredentialsStep
            onSubmit={setApiCredentials}
            onFocus={clearError}
          />
        )}
        {step === 'phone' && (
          <PhoneStep onSubmit={requestCode} onFocus={clearError} />
        )}
        {step === 'code' && (
          <CodeStep onSubmit={submitCode} onFocus={clearError} />
        )}
        {step === 'password' && (
          <PasswordStep onSubmit={submit2FA} onFocus={clearError} />
        )}
        {step === 'error' && (
          <div className="text-center">
            <p style={{ color: 'var(--cn-danger)' }}>
              Authentication failed. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CredentialsStep({
  onSubmit,
  onFocus,
}: {
  onSubmit: (apiId: number, apiHash: string) => Promise<void>;
  onFocus: () => void;
}) {
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(parseInt(apiId, 10), apiHash);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-center" style={{ color: 'var(--cn-text-secondary)' }}>
        Enter your Telegram API credentials from{' '}
        <span className="cn-font-mono" style={{ color: 'var(--cn-accent)' }}>
          my.telegram.org
        </span>
      </p>
      <Input
        label="API ID"
        type="number"
        value={apiId}
        onChange={(e) => setApiId(e.target.value)}
        onFocus={onFocus}
        placeholder="12345678"
        required
      />
      <Input
        label="API Hash"
        type="text"
        value={apiHash}
        onChange={(e) => setApiHash(e.target.value)}
        onFocus={onFocus}
        placeholder="0123456789abcdef..."
        required
      />
      <Button type="submit" loading={loading} disabled={!apiId || !apiHash}>
        <KeyRound size={16} />
        Connect
      </Button>
    </form>
  );
}

function PhoneStep({
  onSubmit,
  onFocus,
}: {
  onSubmit: (phone: string) => Promise<void>;
  onFocus: () => void;
}) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(phone);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-center" style={{ color: 'var(--cn-text-secondary)' }}>
        Enter your phone number with country code
      </p>
      <Input
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onFocus={onFocus}
        placeholder="+1234567890"
        required
      />
      <Button type="submit" loading={loading} disabled={!phone}>
        Send Code
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}

function CodeStep({
  onSubmit,
  onFocus,
}: {
  onSubmit: (code: string) => Promise<void>;
  onFocus: () => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-center" style={{ color: 'var(--cn-text-secondary)' }}>
        Enter the verification code sent to your Telegram
      </p>
      <Input
        label="Verification Code"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onFocus={onFocus}
        placeholder="12345"
        autoComplete="one-time-code"
        required
      />
      <Button type="submit" loading={loading} disabled={!code}>
        Verify
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}

function PasswordStep({
  onSubmit,
  onFocus,
}: {
  onSubmit: (password: string) => Promise<void>;
  onFocus: () => void;
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 justify-center">
        <Shield size={18} style={{ color: 'var(--cn-vault)' }} />
        <p className="text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
          Two-factor authentication required
        </p>
      </div>
      <Input
        label="2FA Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={onFocus}
        placeholder="Enter your 2FA password"
        required
      />
      <Button type="submit" loading={loading} disabled={!password}>
        Sign In
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
