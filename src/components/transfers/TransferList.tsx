'use client';

import { useMemo } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import type { CNTransfer } from '@/types';
import { useTransfersStore } from '@/stores/transfers';
import { TransferCard } from './TransferCard';
import { Button, EmptyState } from '@/components/ui';

type TransferTab = 'active' | 'queued' | 'completed' | 'failed';

const TABS: { key: TransferTab; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'queued', label: 'Queued' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
];

const PRIORITY_ORDER: Record<CNTransfer['priority'], number> = {
  high: 0,
  normal: 1,
  low: 2,
};

function sortTransfers(list: CNTransfer[]): CNTransfer[] {
  return [...list].sort((a, b) => {
    const prioA = PRIORITY_ORDER[a.priority];
    const prioB = PRIORITY_ORDER[b.priority];
    if (prioA !== prioB) return prioA - prioB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function TransferList() {
  const {
    transfers,
    activeTab,
    setActiveTab,
    pauseTransfer,
    resumeTransfer,
    cancelTransfer,
    retryTransfer,
    clearCompleted,
  } = useTransfersStore();

  const grouped = useMemo(() => {
    const active: CNTransfer[] = [];
    const queued: CNTransfer[] = [];
    const completed: CNTransfer[] = [];
    const failed: CNTransfer[] = [];

    for (const t of transfers) {
      switch (t.status) {
        case 'transferring':
        case 'preparing':
          active.push(t);
          break;
        case 'queued':
          queued.push(t);
          break;
        case 'completed':
          completed.push(t);
          break;
        case 'failed':
          failed.push(t);
          break;
        case 'paused':
          active.push(t);
          break;
        // cancelled items are not shown
      }
    }

    return {
      active: sortTransfers(active),
      queued: sortTransfers(queued),
      completed: sortTransfers(completed),
      failed: sortTransfers(failed),
    };
  }, [transfers]);

  const counts: Record<TransferTab, number> = {
    active: grouped.active.length,
    queued: grouped.queued.length,
    completed: grouped.completed.length,
    failed: grouped.failed.length,
  };

  const currentList = grouped[activeTab];

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-lg"
        style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all flex-1 justify-center"
              style={{
                backgroundColor: isActive ? 'var(--cn-bg-primary)' : 'transparent',
                color: isActive ? 'var(--cn-text-primary)' : 'var(--cn-text-secondary)',
                boxShadow: isActive ? 'var(--cn-shadow-sm)' : 'none',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: isActive ? 'var(--cn-accent)' : 'var(--cn-bg-secondary)',
                    color: isActive ? '#fff' : 'var(--cn-text-secondary)',
                  }}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Clear completed button */}
      {activeTab === 'completed' && counts.completed > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearCompleted}>
            <Trash2 size={14} />
            Clear completed
          </Button>
        </div>
      )}

      {/* Transfer list */}
      {currentList.length > 0 ? (
        <div className="flex flex-col gap-3">
          {currentList.map((transfer) => (
            <TransferCard
              key={transfer.id}
              transfer={transfer}
              onPause={pauseTransfer}
              onResume={resumeTransfer}
              onCancel={cancelTransfer}
              onRetry={retryTransfer}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            activeTab === 'active'
              ? Inbox
              : activeTab === 'queued'
                ? Clock
                : activeTab === 'completed'
                  ? CheckCircle2
                  : AlertTriangle
          }
          title={
            activeTab === 'active'
              ? 'No active transfers'
              : activeTab === 'queued'
                ? 'Queue is empty'
                : activeTab === 'completed'
                  ? 'No completed transfers'
                  : 'No failed transfers'
          }
          description={
            activeTab === 'active'
              ? 'Upload or download files to see active transfers here.'
              : activeTab === 'queued'
                ? 'Queued transfers will appear here when the active slots are full.'
                : activeTab === 'completed'
                  ? 'Completed transfers will show up here.'
                  : 'Failed transfers will appear here for retry.'
          }
        />
      )}
    </div>
  );
}
