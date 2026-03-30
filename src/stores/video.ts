import { create } from 'zustand';
import type { CNFile, CNVideoMeta } from '@/types';
import { db } from '@/lib/db/schema';

interface BufferedRange {
  start: number;
  end: number;
}

interface Subtitle {
  label: string;
  content: string;
}

interface VideoStoreState {
  // Current video
  currentVideo: CNFile | null;
  videoMeta: CNVideoMeta | null;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;

  // Buffering
  bufferedRanges: BufferedRange[];

  // Subtitles
  subtitles: Subtitle[];
  activeSubtitleIndex: number;

  // Loading
  isBuffering: boolean;

  // Actions
  setCurrentVideo: (file: CNFile | null) => void;
  loadVideoMeta: (fileId: string) => Promise<void>;
  setIsPlaying: (playing: boolean) => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setBufferedRanges: (ranges: BufferedRange[]) => void;
  setSubtitles: (subtitles: Subtitle[]) => void;
  setActiveSubtitleIndex: (index: number) => void;
  setIsBuffering: (buffering: boolean) => void;
  updatePosition: (time: number) => Promise<void>;
  reset: () => void;
}

export const useVideoStore = create<VideoStoreState>((set, get) => ({
  currentVideo: null,
  videoMeta: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  isFullscreen: false,
  bufferedRanges: [],
  subtitles: [],
  activeSubtitleIndex: -1,
  isBuffering: false,

  setCurrentVideo: (file) => {
    set({
      currentVideo: file,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      bufferedRanges: [],
      subtitles: [],
      activeSubtitleIndex: -1,
      videoMeta: null,
    });
    if (file) {
      get().loadVideoMeta(file.id);
    }
  },

  loadVideoMeta: async (fileId) => {
    try {
      const meta = await db.videoMeta.get(fileId);
      if (meta) {
        set({ videoMeta: meta });
      }
    } catch {
      // Meta not found, continue without it
    }
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  togglePlayPause: () => set((s) => ({ isPlaying: !s.isPlaying })),

  seek: (time) => set({ currentTime: Math.max(0, Math.min(time, get().duration)) }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), isMuted: false }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  setPlaybackRate: (rate) => set({ playbackRate: rate }),

  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),

  setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),

  setBufferedRanges: (ranges) => set({ bufferedRanges: ranges }),

  setSubtitles: (subtitles) => set({ subtitles }),

  setActiveSubtitleIndex: (index) => set({ activeSubtitleIndex: index }),

  setIsBuffering: (buffering) => set({ isBuffering: buffering }),

  updatePosition: async (time) => {
    const { currentVideo } = get();
    if (!currentVideo) return;
    try {
      const existing = await db.videoMeta.get(currentVideo.id);
      if (existing) {
        await db.videoMeta.update(currentVideo.id, {
          lastPosition: time,
          lastPlayedAt: new Date(),
        });
      } else {
        await db.videoMeta.put({
          fileId: currentVideo.id,
          title: currentVideo.name,
          duration: get().duration,
          resolution: '',
          lastPosition: time,
          lastPlayedAt: new Date(),
          subtitleFileIds: [],
        });
      }
    } catch {
      // Silently fail on position save
    }
  },

  reset: () =>
    set({
      currentVideo: null,
      videoMeta: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      isMuted: false,
      playbackRate: 1,
      isFullscreen: false,
      bufferedRanges: [],
      subtitles: [],
      activeSubtitleIndex: -1,
      isBuffering: false,
    }),
}));
