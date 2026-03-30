import { create } from 'zustand';
import type { CNFile, CNMusicMeta } from '@/types';
import { db } from '@/lib/db/schema';

type RepeatMode = 'off' | 'one' | 'all';

interface PlayerStoreState {
  // Current track
  currentTrack: CNFile | null;
  musicMeta: CNMusicMeta | null;

  // Queue
  queue: CNFile[];
  queueIndex: number;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Modes
  shuffle: boolean;
  repeat: RepeatMode;

  // Library
  musicLibrary: CNFile[];
  allMusicMeta: CNMusicMeta[];
  isLibraryLoaded: boolean;

  // Actions - Playback
  play: (file?: CNFile) => void;
  pause: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Actions - Modes
  toggleShuffle: () => void;
  toggleRepeat: () => void;

  // Actions - Queue
  addToQueue: (file: CNFile) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  playFromQueue: (index: number) => void;

  // Actions - Library
  loadMusicLibrary: () => Promise<void>;
  loadMusicMeta: (fileId: string) => Promise<void>;
  updatePlayCount: (fileId: string) => Promise<void>;

  // Actions - Misc
  setCurrentTrack: (file: CNFile | null) => void;
  reset: () => void;
}

function getShuffledIndex(currentIndex: number, length: number): number {
  if (length <= 1) return 0;
  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  currentTrack: null,
  musicMeta: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'off',
  musicLibrary: [],
  allMusicMeta: [],
  isLibraryLoaded: false,

  play: (file) => {
    if (file) {
      const { queue } = get();
      const existingIndex = queue.findIndex((f) => f.id === file.id);
      if (existingIndex >= 0) {
        set({ currentTrack: file, queueIndex: existingIndex, isPlaying: true, currentTime: 0 });
      } else {
        set({ currentTrack: file, isPlaying: true, currentTime: 0 });
      }
      get().loadMusicMeta(file.id);
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => set({ isPlaying: false }),

  togglePlayPause: () => {
    const { isPlaying, currentTrack } = get();
    if (currentTrack) {
      set({ isPlaying: !isPlaying });
    }
  },

  next: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (repeat === 'one') {
      set({ currentTime: 0, isPlaying: true });
      return;
    } else if (shuffle) {
      nextIndex = getShuffledIndex(queueIndex, queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          set({ isPlaying: false });
          return;
        }
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      set({ currentTrack: nextTrack, queueIndex: nextIndex, currentTime: 0, isPlaying: true });
      get().loadMusicMeta(nextTrack.id);
    }
  },

  previous: () => {
    const { queue, queueIndex, currentTime, shuffle } = get();

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    if (queue.length === 0) return;

    let prevIndex: number;
    if (shuffle) {
      prevIndex = getShuffledIndex(queueIndex, queue.length);
    } else {
      prevIndex = queueIndex - 1;
      if (prevIndex < 0) prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      set({ currentTrack: prevTrack, queueIndex: prevIndex, currentTime: 0, isPlaying: true });
      get().loadMusicMeta(prevTrack.id);
    }
  },

  seek: (time) => set({ currentTime: Math.max(0, Math.min(time, get().duration)) }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: false }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  toggleRepeat: () =>
    set((s) => {
      const modes: RepeatMode[] = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(s.repeat);
      return { repeat: modes[(currentIndex + 1) % modes.length] };
    }),

  addToQueue: (file) => {
    const { queue } = get();
    set({ queue: [...queue, file] });
  },

  removeFromQueue: (index) => {
    const { queue, queueIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    let newIndex = queueIndex;
    if (index < queueIndex) newIndex--;
    if (index === queueIndex) newIndex = Math.min(queueIndex, newQueue.length - 1);
    set({ queue: newQueue, queueIndex: newIndex });
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue, queueIndex } = get();
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, moved);

    let newIndex = queueIndex;
    if (fromIndex === queueIndex) {
      newIndex = toIndex;
    } else {
      if (fromIndex < queueIndex && toIndex >= queueIndex) newIndex--;
      if (fromIndex > queueIndex && toIndex <= queueIndex) newIndex++;
    }
    set({ queue: newQueue, queueIndex: newIndex });
  },

  clearQueue: () => set({ queue: [], queueIndex: -1 }),

  playFromQueue: (index) => {
    const { queue } = get();
    const track = queue[index];
    if (track) {
      set({ currentTrack: track, queueIndex: index, currentTime: 0, isPlaying: true });
      get().loadMusicMeta(track.id);
    }
  },

  loadMusicLibrary: async () => {
    try {
      const allFiles = await db.files
        .filter((f) => f.mime.startsWith('audio/') && !f.deleted)
        .toArray();
      const allMeta = await db.musicMeta.toArray();
      set({ musicLibrary: allFiles, allMusicMeta: allMeta, isLibraryLoaded: true });
    } catch {
      set({ musicLibrary: [], allMusicMeta: [], isLibraryLoaded: true });
    }
  },

  loadMusicMeta: async (fileId) => {
    try {
      const meta = await db.musicMeta.get(fileId);
      if (meta) {
        set({ musicMeta: meta });
      } else {
        set({ musicMeta: null });
      }
    } catch {
      set({ musicMeta: null });
    }
  },

  updatePlayCount: async (fileId) => {
    try {
      const existing = await db.musicMeta.get(fileId);
      if (existing) {
        await db.musicMeta.update(fileId, {
          playCount: existing.playCount + 1,
          lastPlayedAt: new Date(),
        });
      }
    } catch {
      // Silently fail
    }
  },

  setCurrentTrack: (file) => {
    set({ currentTrack: file, currentTime: 0, musicMeta: null });
    if (file) {
      get().loadMusicMeta(file.id);
    }
  },

  reset: () =>
    set({
      currentTrack: null,
      musicMeta: null,
      queue: [],
      queueIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      shuffle: false,
      repeat: 'off',
    }),
}));
