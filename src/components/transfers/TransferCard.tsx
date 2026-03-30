'use client';

import {
  ArrowUp,
  ArrowDown,
  Pause,
  Play,
  X,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import type { CNTransfer } from '@/types';
import { formatFileSize, formatSpeed, formatETA } from '@/lib/utils/formatting';
import { Button, Badge } from '@/components/ui';

interface TransferCardProps {
  transfer: CNTransfer;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}

const STATUS_BADGE: Record<
  CNTransfer['status'],
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'accent' }
> = {
  queued: { label: 'Queued', variant: 'default' },
  preparing: { label: 'Preparing', variant: 'accent' },
  transferring: { label: 'Transferring', variant: 'accent' },
  paused: { label: 'Paused', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

export function TransferCard({ transfer, onPause, onResume, onCancel, onRetry }: TransferCardProps) {
  const isActive = transfer.status === 'transferring' || transfer.status === 'preparing';
  const isPaused = transfer.status === 'paused';
  const isFailed = transfer.status === 'failed';
  const isCompleted = transfer.status === 'completed';
  const isQueued = transfer.status === 'queued';
  const canPauseResume = isActive || isPaused || isQueued;
  const canCancel = isActive || isPaused || isQueued;

  const eta =
    isActive && transfer.speed > 0
      ? (transfer.fileSize - transfer.bytesTransferred) / transfer.speed
      : -1;

  const statusBadge = STATUS_BADGE[transfer.status];
  const DirectionIcon = transfer.type === 'upload' ? ArrowUp : ArrowDown;

  return (
    <div
      className="cn-panel p-4 flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--cn-bg-secondary)',
        border: '1px solid var(--cn-border)',
        borderRadius: 'var(--cn-radius-lg)',
      }}
    >
      {/* Top row: icon, name, badge, actions */}
      <div className="flex items-center gap-3">
        {/* Direction icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
          style={{
            backgroundColor: transfer.type === 'upload'
              ? 'rgba(16, 185, 129, 0.12)'
              : 'rgba(59, 130, 246, 0.12)',
          }}
        >
          <DirectionIcon
            size={18}
            style={{
              color: transfer.type === 'upload' ? 'var(--cn-success)' : 'var(--cn-accent)',
            }}
          />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium truncate"
              style={{ color: 'var(--cn-text-primary)' }}
              title={transfer.fileName}
            >
              {transfer.fileName}
            </span>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
              {formatFileSize(transfer.bytesTransferred)} / {formatFileSize(transfer.fileSize)}
            </span>
            {isActive && transfer.speed > 0 && (
              <span className="text-xs" style={{ color: 'var(--cn-accent)' }}>
                {formatSpeed(transfer.speed)}
              </span>
            )}
            {isActive && eta > 0 && (
              <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
                ETA {formatETA(eta)}
              </span>
            )}
            {transfer.totalChunks > 1 && (
              <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
                {transfer.currentChunk}/{transfer.totalChunks} chunks
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isFailed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRetry(transfer.id)}
              title="Retry"
            >
              <RotateCcw size={15} />
            </Button>
          )}
          {canPauseResume && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                isActive || isQueued
                  ? onPause(transfer.id)
                  : onResume(transfer.id)
              }
              title={isActive || isQueued ? 'Pause' : 'Resume'}
            >
              {isActive || isQueued ? <Pause size={15} /> : <Play size={15} />}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(transfer.id)}
              title="Cancel"
            >
              <X size={15} />
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {!isCompleted && transfer.status !== 'cancelled' && (
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${transfer.progress}%`,
              backgroundColor: isFailed ? 'var(--cn-danger)' : 'var(--cn-accent)',
              boxShadow: isActive ? '0 0 8px var(--cn-accent)' : 'none',
            }}
          />
        </div>
      )}

      {/* Completed full bar */}
      {isCompleted && (
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: '100%',
              backgroundColor: 'var(--cn-success)',
            }}
          />
        </div>
      )}

      {/* Progress percentage */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
          {transfer.progress}%
        </span>
        {transfer.retryCount > 0 && (
          <span className="text-xs" style={{ color: 'var(--cn-warning)' }}>
            Retry #{transfer.retryCount}
          </span>
        )}
      </div>

      {/* Error message */}
      {isFailed && transfer.error && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--cn-danger)',
          }}
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          <span className="truncate">{transfer.error}</span>
        </div>
      )}
    </div>
  );
}
