'use client';

import { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  ChevronDown,
  Music,
  Trash2,
} from 'lucide-react';
import { usePlayerStore } from '@/stores/player';
import { formatDuration } from '@/lib/utils/formatting';

interface NowPlayingProps {
  onClose: () => void;
}

export function NowPlaying({ onClose }: NowPlayingProps) {
  const [showQueue, setShowQueue] = useState(false);

  const {
    currentTrack,
    musicMeta,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    queue,
    queueIndex,
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playFromQueue,
    removeFromQueue,
  } = usePlayerStore();

  if (!currentTrack) return null;

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    seek(fraction * duration);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(parseFloat(e.target.value));
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Deterministic color from track name
  function artColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 45%, 30%)`;
  }

  const title = musicMeta?.title || currentTrack.name;
  const artist = musicMeta?.artist || 'Unknown Artist';
  const album = musicMeta?.album || 'Unknown Album';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: 'var(--cn-bg-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          className="cn-interactive p-2 rounded-md"
          onClick={onClose}
          aria-label="Close Now Playing"
        >
          <ChevronDown size={20} style={{ color: 'var(--cn-text-primary)' }} />
        </button>
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--cn-text-secondary)' }}>
          Now Playing
        </span>
        <button
          className="cn-interactive p-2 rounded-md"
          onClick={() => setShowQueue(!showQueue)}
          aria-label="Toggle Queue"
          style={{ color: showQueue ? 'var(--cn-accent)' : 'var(--cn-text-secondary)' }}
        >
          <ListMusic size={20} />
        </button>
      </div>

      {showQueue ? (
        /* Queue view */
        <QueueView
          queue={queue}
          queueIndex={queueIndex}
          onPlayFromQueue={playFromQueue}
          onRemove={removeFromQueue}
        />
      ) : (
        /* Main now-playing view */
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 max-w-lg mx-auto w-full">
          {/* Album art placeholder */}
          <div
            className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl flex items-center justify-center shadow-lg mb-8"
            style={{
              backgroundColor: artColor(album),
              boxShadow: 'var(--cn-shadow-glow)',
            }}
          >
            <Music size={64} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>

          {/* Track info */}
          <div className="text-center mb-6 w-full">
            <h2
              className="text-lg font-semibold truncate"
              style={{ color: 'var(--cn-text-primary)' }}
            >
              {title}
            </h2>
            <p className="text-sm truncate" style={{ color: 'var(--cn-text-secondary)' }}>
              {artist} &mdash; {album}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full mb-2">
            <div
              className="w-full h-1.5 rounded-full cursor-pointer relative"
              style={{ backgroundColor: 'var(--cn-border)' }}
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: 'var(--cn-accent)',
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs font-mono" style={{ color: 'var(--cn-text-secondary)' }}>
                {formatDuration(currentTime)}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--cn-text-secondary)' }}>
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-4">
            <button
              className="cn-interactive p-2"
              onClick={toggleShuffle}
              aria-label="Toggle Shuffle"
              style={{ color: shuffle ? 'var(--cn-accent)' : 'var(--cn-text-secondary)' }}
            >
              <Shuffle size={18} />
            </button>

            <button
              className="cn-interactive p-2"
              onClick={previous}
              aria-label="Previous"
              style={{ color: 'var(--cn-text-primary)' }}
            >
              <SkipBack size={24} fill="currentColor" />
            </button>

            <button
              className="cn-interactive w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--cn-accent)' }}
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={26} fill="#FFFFFF" color="#FFFFFF" />
              ) : (
                <Play size={26} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: 2 }} />
              )}
            </button>

            <button
              className="cn-interactive p-2"
              onClick={next}
              aria-label="Next"
              style={{ color: 'var(--cn-text-primary)' }}
            >
              <SkipForward size={24} fill="currentColor" />
            </button>

            <button
              className="cn-interactive p-2"
              onClick={toggleRepeat}
              aria-label="Toggle Repeat"
              style={{ color: repeat !== 'off' ? 'var(--cn-accent)' : 'var(--cn-text-secondary)' }}
            >
              {repeat === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 mt-6 w-full max-w-xs">
            <button
              className="cn-interactive"
              onClick={toggleMute}
              style={{ color: 'var(--cn-text-secondary)' }}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 cursor-pointer"
              style={{ accentColor: 'var(--cn-accent)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Queue View ---------- */

interface QueueViewProps {
  queue: import('@/types').CNFile[];
  queueIndex: number;
  onPlayFromQueue: (index: number) => void;
  onRemove: (index: number) => void;
}

function QueueView({ queue, queueIndex, onPlayFromQueue, onRemove }: QueueViewProps) {
  if (queue.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
          Queue is empty
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <h3
        className="text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--cn-text-secondary)' }}
      >
        Up Next ({queue.length} tracks)
      </h3>
      {queue.map((track, i) => (
        <div
          key={`${track.id}-${i}`}
          className="flex items-center gap-3 py-2.5 group"
          style={{
            borderBottom: '1px solid var(--cn-border)',
            opacity: i < queueIndex ? 0.5 : 1,
          }}
        >
          <button
            className="flex-1 text-left min-w-0 cn-interactive"
            onClick={() => onPlayFromQueue(i)}
          >
            <span
              className="text-sm truncate block"
              style={{
                color: i === queueIndex ? 'var(--cn-accent)' : 'var(--cn-text-primary)',
                fontWeight: i === queueIndex ? 600 : 400,
              }}
            >
              {track.name}
            </span>
          </button>
          <button
            className="cn-interactive p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(i)}
            aria-label="Remove from queue"
            style={{ color: 'var(--cn-text-secondary)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
