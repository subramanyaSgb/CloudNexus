'use client';

import { useState, useEffect, useMemo } from 'react';
import { Video, Search, Clock, Play } from 'lucide-react';
import { Input, EmptyState, Spinner } from '@/components/ui';
import { useVideoStore } from '@/stores/video';
import { formatDuration, formatRelativeDate } from '@/lib/utils/formatting';
import type { CNFile, CNVideoMeta } from '@/types';
import { db } from '@/lib/db/schema';

export function VideoLibrary() {
  const [videos, setVideos] = useState<CNFile[]>([]);
  const [videoMetas, setVideoMetas] = useState<Map<string, CNVideoMeta>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { setCurrentVideo } = useVideoStore();

  useEffect(() => {
    async function loadVideos() {
      setIsLoading(true);
      try {
        const allFiles = await db.files
          .filter((f) => f.mime.startsWith('video/') && !f.deleted)
          .toArray();
        const allMeta = await db.videoMeta.toArray();
        const metaMap = new Map<string, CNVideoMeta>();
        allMeta.forEach((m) => metaMap.set(m.fileId, m));
        setVideos(allFiles);
        setVideoMetas(metaMap);
      } catch {
        setVideos([]);
      }
      setIsLoading(false);
    }
    loadVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    const q = searchQuery.toLowerCase();
    return videos.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [videos, searchQuery]);

  function handlePlayVideo(file: CNFile) {
    setCurrentVideo(file);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={Video}
        title="No videos yet"
        description="Upload video files to watch them here. Supported formats include MP4, MKV, AVI, and more."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--cn-text-secondary)' }}
        />
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Video grid */}
      {filteredVideos.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No videos found"
          description={`No results for "${searchQuery}"`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVideos.map((video) => {
            const meta = videoMetas.get(video.id);
            return (
              <VideoCard
                key={video.id}
                file={video}
                meta={meta}
                onPlay={handlePlayVideo}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface VideoCardProps {
  file: CNFile;
  meta?: CNVideoMeta;
  onPlay: (file: CNFile) => void;
}

function VideoCard({ file, meta, onPlay }: VideoCardProps) {
  const hasWatched = meta?.lastPlayedAt;
  const resumePosition = meta?.lastPosition ?? 0;
  const totalDuration = meta?.duration ?? 0;
  const watchProgress = totalDuration > 0 ? (resumePosition / totalDuration) * 100 : 0;

  return (
    <button
      className="cn-panel group text-left w-full overflow-hidden cn-interactive"
      style={{ padding: 0 }}
      onClick={() => onPlay(file)}
    >
      {/* Thumbnail placeholder */}
      <div
        className="relative aspect-video w-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
      >
        <Video size={40} style={{ color: 'var(--cn-text-secondary)', opacity: 0.4 }} />

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--cn-accent)' }}
          >
            <Play size={20} fill="#FFFFFF" color="#FFFFFF" />
          </div>
        </div>

        {/* Duration badge */}
        {totalDuration > 0 && (
          <span
            className="absolute bottom-2 right-2 text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#FFFFFF' }}
          >
            {formatDuration(totalDuration)}
          </span>
        )}

        {/* Watch progress bar */}
        {watchProgress > 0 && watchProgress < 98 && (
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <div
              className="h-full"
              style={{
                width: `${watchProgress}%`,
                backgroundColor: 'var(--cn-accent)',
              }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3
          className="text-sm font-medium truncate"
          style={{ color: 'var(--cn-text-primary)' }}
          title={file.name}
        >
          {file.name}
        </h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
          {meta?.resolution && <span>{meta.resolution}</span>}
          {hasWatched && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatRelativeDate(new Date(meta.lastPlayedAt!))}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
