'use client';

import { useMemo } from 'react';
import { Pause, Play, ArrowUpDown } from 'lucide-react';
import { useTransfersStore } from '@/stores/transfers';
import { useTransferEngine } from '@/hooks/useTransferEngine';
import { TransferList } from '@/components/transfers/TransferList';
import { OverallProgress } from '@/components/transfers/OverallProgress';
import { Button, Spinner } from '@/components/ui';
import { formatFileSize } from '@/lib/utils/formatting';

export default function TransfersPage() {
  const { pauseAll, resumeAll } = useTransferEngine();
  const { transfers, isLoading } = useTransfersStore();

  const stats = useMemo(() => {
    const active = transfers.filter(
      (t) => t.status === 'transferring' || t.status === 'preparing' || t.status === 'queued'
    );
    const paused = transfers.filter((t) => t.status === 'paused');
    const completed = transfers.filter((t) => t.status === 'completed');
    const totalUploaded = completed
      .filter((t) => t.type === 'upload')
      .reduce((sum, t) => sum + t.fileSize, 0);
    const totalDownloaded = completed
      .filter((t) => t.type === 'download')
      .reduce((sum, t) => sum + t.fileSize, 0);

    const hasActive = active.length > 0;
    const hasPaused = paused.length > 0;

    return { active: active.length, paused: paused.length, completed: completed.length, totalUploaded, totalDownloaded, hasActive, hasPaused };
  }, [transfers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowUpDown size={24} style={{ color: 'var(--cn-accent)' }} />
          <h1 className="text-xl font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Transfer Manager
          </h1>
        </div>
        {(stats.hasActive || stats.hasPaused) && (
          <div className="flex items-center gap-2">
            {stats.hasActive && (
              <Button variant="secondary" size="sm" onClick={pauseAll}>
                <Pause size={14} />
                Pause All
              </Button>
            )}
            {stats.hasPaused && (
              <Button variant="secondary" size="sm" onClick={resumeAll}>
                <Play size={14} />
                Resume All
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Overall progress */}
      <OverallProgress />

      {/* Stats summary */}
      {stats.completed > 0 && (
        <div
          className="flex items-center gap-6 px-4 py-3 rounded-lg"
          style={{
            backgroundColor: 'var(--cn-bg-secondary)',
            border: '1px solid var(--cn-border)',
            borderRadius: 'var(--cn-radius-lg)',
          }}
        >
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
              Total uploaded
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--cn-text-primary)' }}>
              {formatFileSize(stats.totalUploaded)}
            </span>
          </div>
          <div
            className="w-px h-8"
            style={{ backgroundColor: 'var(--cn-border)' }}
          />
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
              Total downloaded
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--cn-text-primary)' }}>
              {formatFileSize(stats.totalDownloaded)}
            </span>
          </div>
          <div
            className="w-px h-8"
            style={{ backgroundColor: 'var(--cn-border)' }}
          />
          <div className="flex flex-col">
            <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
              Completed
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--cn-text-primary)' }}>
              {stats.completed} file{stats.completed !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Transfer list with tabs */}
      <TransferList />
    </div>
  );
}
