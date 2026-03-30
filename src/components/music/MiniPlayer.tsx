'use client';

import { Play, Pause, SkipForward, ChevronUp } from 'lucide-react';
import { usePlayerStore } from '@/stores/player';

interface MiniPlayerProps {
  onExpand: () => void;
}

export function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const {
    currentTrack,
    musicMeta,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    next,
  } = usePlayerStore();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const title = musicMeta?.title || currentTrack.name;
  const artist = musicMeta?.artist || 'Unknown Artist';

  return (
    <div
      className="relative shrink-0"
      style={{
        backgroundColor: 'var(--cn-bg-secondary)',
        borderTop: '1px solid var(--cn-border)',
      }}
    >
      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: 'var(--cn-border)' }}
      >
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--cn-accent)',
            transition: 'width 0.3s linear',
          }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Track info (clickable to expand) */}
        <button
          className="flex-1 min-w-0 text-left cn-interactive flex items-center gap-3"
          onClick={onExpand}
        >
          {/* Small art placeholder */}
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
          >
            <ChevronUp size={14} style={{ color: 'var(--cn-text-secondary)' }} />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--cn-text-primary)' }}
            >
              {title}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--cn-text-secondary)' }}>
              {artist}
            </p>
          </div>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="cn-interactive p-2 rounded-md"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{ color: 'var(--cn-text-primary)' }}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button
            className="cn-interactive p-2 rounded-md"
            onClick={next}
            aria-label="Next track"
            style={{ color: 'var(--cn-text-secondary)' }}
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
