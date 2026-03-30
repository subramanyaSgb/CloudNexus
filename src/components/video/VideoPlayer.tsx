'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  Loader2,
} from 'lucide-react';
import { useVideoStore } from '@/stores/video';
import { formatDuration } from '@/lib/utils/formatting';

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const CONTROLS_HIDE_DELAY = 3000;
const POSITION_SAVE_INTERVAL = 5000;

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const positionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [seekHover, setSeekHover] = useState<number | null>(null);

  const {
    currentVideo,
    videoMeta,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    bufferedRanges,
    subtitles,
    activeSubtitleIndex,
    isBuffering,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setIsFullscreen,
    setBufferedRanges,
    setIsBuffering,
    updatePosition,
    togglePlayPause,
  } = useVideoStore();

  // Sync video element with store state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  // Resume from last position
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoMeta) return;
    if (videoMeta.lastPosition > 0 && videoMeta.lastPosition < (videoMeta.duration - 5)) {
      video.currentTime = videoMeta.lastPosition;
    }
  }, [videoMeta]);

  // Save position periodically
  useEffect(() => {
    positionTimerRef.current = setInterval(() => {
      if (isPlaying && currentTime > 0) {
        updatePosition(currentTime);
      }
    }, POSITION_SAVE_INTERVAL);

    return () => {
      if (positionTimerRef.current) clearInterval(positionTimerRef.current);
    };
  }, [isPlaying, currentTime, updatePosition]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying]);

  // Show/hide controls is handled in handlePlayPause and mouse events
  // No effect needed here — isPlaying changes are triggered by user actions

  function seekRelative(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  }

  function handleToggleFullscreen() {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          resetControlsTimer();
          break;
        case 'f':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          resetControlsTimer();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
          resetControlsTimer();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          resetControlsTimer();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          resetControlsTimer();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          resetControlsTimer();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, togglePlayPause, toggleMute, setVolume, resetControlsTimer]);

  // Fullscreen change listener
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [setIsFullscreen]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    updateBuffered();
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  }

  function updateBuffered() {
    const video = videoRef.current;
    if (!video) return;
    const ranges: { start: number; end: number }[] = [];
    for (let i = 0; i < video.buffered.length; i++) {
      ranges.push({ start: video.buffered.start(i), end: video.buffered.end(i) });
    }
    setBufferedRanges(ranges);
  }

  function handleSeekBarClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    const time = fraction * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }

  function handleSeekBarHover(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    setSeekHover(fraction * duration);
  }

  async function handlePiP() {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP not supported or blocked
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(parseFloat(e.target.value));
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeSubtitle =
    activeSubtitleIndex >= 0 && activeSubtitleIndex < subtitles.length
      ? subtitles[activeSubtitleIndex]
      : null;

  // Generate a blob URL placeholder (in real app, this streams from Telegram)
  const videoSrc = currentVideo ? `#video-${currentVideo.id}` : '';

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden group"
      style={{ backgroundColor: '#000' }}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={videoSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={() => {
          setIsPlaying(false);
          updatePosition(0);
        }}
        onClick={togglePlayPause}
        playsInline
      />

      {/* Subtitle overlay */}
      {activeSubtitle && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded text-center max-w-[80%] pointer-events-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: '#FFFFFF',
            fontSize: '1.125rem',
          }}
        >
          {activeSubtitle.content}
        </div>
      )}

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={48} className="animate-spin" style={{ color: 'var(--cn-accent)' }} />
        </div>
      )}

      {/* Big play button when paused and controls visible */}
      {!isPlaying && showControls && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          >
            <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className="absolute inset-x-0 bottom-0 transition-opacity duration-300"
        style={{
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '2rem 1rem 0.75rem',
        }}
      >
        {/* Seek bar */}
        <div
          className="relative w-full h-1.5 rounded-full cursor-pointer mb-3 group/seek"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          onClick={handleSeekBarClick}
          onMouseMove={handleSeekBarHover}
          onMouseLeave={() => setSeekHover(null)}
        >
          {/* Buffered ranges */}
          {bufferedRanges.map((range, i) => (
            <div
              key={i}
              className="absolute top-0 h-full rounded-full"
              style={{
                left: `${(range.start / duration) * 100}%`,
                width: `${((range.end - range.start) / duration) * 100}%`,
                backgroundColor: 'rgba(255,255,255,0.35)',
              }}
            />
          ))}

          {/* Progress */}
          <div
            className="absolute top-0 h-full rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: 'var(--cn-accent)',
            }}
          />

          {/* Hover preview time */}
          {seekHover !== null && (
            <div
              className="absolute -top-8 text-xs px-2 py-0.5 rounded pointer-events-none -translate-x-1/2"
              style={{
                left: `${(seekHover / duration) * 100}%`,
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: '#FFFFFF',
              }}
            >
              {formatDuration(seekHover)}
            </div>
          )}

          {/* Seek handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity"
            style={{
              left: `${progress}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--cn-accent)',
              boxShadow: '0 0 4px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Play/pause */}
          <button
            className="text-white hover:opacity-80 transition-opacity"
            onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={22} fill="#FFFFFF" /> : <Play size={22} fill="#FFFFFF" />}
          </button>

          {/* Time display */}
          <span className="text-xs text-white font-mono min-w-[90px]">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-1.5 group/vol">
            <button
              className="text-white hover:opacity-80 transition-opacity"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              onClick={(e) => e.stopPropagation()}
              className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-white h-1 cursor-pointer"
              style={{ accentColor: 'var(--cn-accent)' }}
            />
          </div>

          {/* Playback speed */}
          <div className="relative">
            <button
              className="text-white text-xs font-medium hover:opacity-80 transition-opacity px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              onClick={(e) => { e.stopPropagation(); setShowSpeedMenu((prev) => !prev); }}
            >
              {playbackRate}x
            </button>
            {showSpeedMenu && (
              <div
                className="absolute bottom-full right-0 mb-2 rounded-lg overflow-hidden py-1"
                style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
              >
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    className="block w-full text-left px-4 py-1.5 text-xs text-white hover:bg-white/10 transition-colors"
                    style={{
                      fontWeight: rate === playbackRate ? 700 : 400,
                      color: rate === playbackRate ? 'var(--cn-accent)' : '#FFFFFF',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PiP */}
          <button
            className="text-white hover:opacity-80 transition-opacity"
            onClick={(e) => { e.stopPropagation(); handlePiP(); }}
            aria-label="Picture in Picture"
          >
            <PictureInPicture2 size={18} />
          </button>

          {/* Fullscreen */}
          <button
            className="text-white hover:opacity-80 transition-opacity"
            onClick={(e) => { e.stopPropagation(); handleToggleFullscreen(); }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
