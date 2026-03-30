'use client';

import { useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useTransfersStore } from '@/stores/transfers';
import { formatFileSize, formatSpeed } from '@/lib/utils/formatting';

interface OverallProgressProps {
  compact?: boolean;
}

export function OverallProgress({ compact = false }: OverallProgressProps) {
  const transfers = useTransfersStore((s) => s.transfers);

  const stats = useMemo(() => {
    const active = transfers.filter(
      (t) => t.status === 'transferring' || t.status === 'preparing' || t.status === 'queued' || t.status === 'paused'
    );
    const transferring = transfers.filter(
      (t) => t.status === 'transferring' || t.status === 'preparing'
    );

    const totalBytes = active.reduce((sum, t) => sum + t.fileSize, 0);
    const transferredBytes = active.reduce((sum, t) => sum + t.bytesTransferred, 0);
    const totalSpeed = transferring.reduce((sum, t) => sum + t.speed, 0);
    const overallProgress = totalBytes > 0 ? Math.round((transferredBytes / totalBytes) * 100) : 0;

    return {
      activeCount: active.length,
      transferringCount: transferring.length,
      totalBytes,
      transferredBytes,
      totalSpeed,
      overallProgress,
    };
  }, [transfers]);

  if (stats.activeCount === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <ArrowUpDown size={14} style={{ color: 'var(--cn-accent)' }} />
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${stats.overallProgress}%`,
              backgroundColor: 'var(--cn-accent)',
              boxShadow: stats.transferringCount > 0 ? '0 0 6px var(--cn-accent)' : 'none',
            }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--cn-text-secondary)' }}>
          {stats.activeCount} file{stats.activeCount !== 1 ? 's' : ''} &middot; {stats.overallProgress}%
        </span>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: 'var(--cn-bg-secondary)',
        border: '1px solid var(--cn-border)',
        borderRadius: 'var(--cn-radius-lg)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={18} style={{ color: 'var(--cn-accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--cn-text-primary)' }}>
            {stats.activeCount} active transfer{stats.activeCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {stats.totalSpeed > 0 && (
            <span className="text-sm font-medium" style={{ color: 'var(--cn-accent)' }}>
              {formatSpeed(stats.totalSpeed)}
            </span>
          )}
          <span className="text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
            {formatFileSize(stats.transferredBytes)} / {formatFileSize(stats.totalBytes)}
          </span>
        </div>
      </div>

      <div
        className="w-full h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${stats.overallProgress}%`,
            backgroundColor: 'var(--cn-accent)',
            boxShadow: stats.transferringCount > 0 ? '0 0 8px var(--cn-accent)' : 'none',
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
          {stats.overallProgress}% complete
        </span>
        <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
          {stats.transferringCount} transferring
        </span>
      </div>
    </div>
  );
}
