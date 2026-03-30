'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { VideoLibrary } from '@/components/video/VideoLibrary';
import { useVideoStore } from '@/stores/video';

export default function VideosPage() {
  const { currentVideo, reset } = useVideoStore();

  function handleBack() {
    reset();
  }

  return (
    <div className="space-y-4">
      {currentVideo ? (
        <>
          {/* Back button + title */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft size={16} />
              Back to Library
            </Button>
            <h1
              className="text-sm font-medium truncate"
              style={{ color: 'var(--cn-text-primary)' }}
            >
              {currentVideo.name}
            </h1>
          </div>

          {/* Video player */}
          <VideoPlayer />
        </>
      ) : (
        <>
          <h1
            className="text-xl font-semibold"
            style={{ color: 'var(--cn-text-primary)' }}
          >
            Videos
          </h1>
          <VideoLibrary />
        </>
      )}
    </div>
  );
}
