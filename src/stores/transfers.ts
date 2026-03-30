import { create } from 'zustand';
import type { CNTransfer } from '@/types';
import * as transferOps from '@/lib/db/transfers';

type TransferTab = 'active' | 'queued' | 'completed' | 'failed';

interface TransfersStoreState {
  transfers: CNTransfer[];
  activeTab: TransferTab;
  isLoading: boolean;

  // Actions
  loadTransfers: () => Promise<void>;
  setActiveTab: (tab: TransferTab) => void;
  addTransfer: (data: Parameters<typeof transferOps.createTransfer>[0]) => Promise<CNTransfer>;
  updateProgress: (id: string, bytesTransferred: number, speed: number, currentChunk: number) => Promise<void>;
  setStatus: (id: string, status: CNTransfer['status'], error?: string) => Promise<void>;
  pauseTransfer: (id: string) => Promise<void>;
  resumeTransfer: (id: string) => Promise<void>;
  cancelTransfer: (id: string) => Promise<void>;
  retryTransfer: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
}

export const useTransfersStore = create<TransfersStoreState>((set, get) => ({
  transfers: [],
  activeTab: 'active',
  isLoading: false,

  loadTransfers: async () => {
    set({ isLoading: true });
    const all = await Promise.all([
      transferOps.getActiveTransfers(),
      transferOps.getCompletedTransfers(),
      transferOps.getFailedTransfers(),
    ]);
    set({ transfers: all.flat(), isLoading: false });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  addTransfer: async (data) => {
    const transfer = await transferOps.createTransfer(data);
    set({ transfers: [...get().transfers, transfer] });
    return transfer;
  },

  updateProgress: async (id, bytesTransferred, speed, currentChunk) => {
    await transferOps.updateTransferProgress(id, bytesTransferred, speed, currentChunk);
    const updated = await transferOps.getTransfer(id);
    if (updated) {
      set({
        transfers: get().transfers.map((t) => (t.id === id ? updated : t)),
      });
    }
  },

  setStatus: async (id, status, error) => {
    await transferOps.setTransferStatus(id, status, error);
    const updated = await transferOps.getTransfer(id);
    if (updated) {
      set({
        transfers: get().transfers.map((t) => (t.id === id ? updated : t)),
      });
    }
  },

  pauseTransfer: async (id) => {
    await transferOps.setTransferStatus(id, 'paused');
    await get().loadTransfers();
  },

  resumeTransfer: async (id) => {
    await transferOps.setTransferStatus(id, 'queued');
    await get().loadTransfers();
  },

  cancelTransfer: async (id) => {
    await transferOps.setTransferStatus(id, 'cancelled');
    await get().loadTransfers();
  },

  retryTransfer: async (id) => {
    await transferOps.incrementRetryCount(id);
    await transferOps.setTransferStatus(id, 'queued');
    await get().loadTransfers();
  },

  clearCompleted: async () => {
    await transferOps.clearCompletedTransfers();
    await get().loadTransfers();
  },
}));
