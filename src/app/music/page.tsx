'use client';

import { useState } from 'react';
import { MusicLibrary } from '@/components/music/MusicLibrary';
import { NowPlaying } from '@/components/music/NowPlaying';
import { usePlayerStore } from '@/stores/player';

export default function MusicPage() {
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const { currentTrack } = usePlayerStore();

  return (
    <div className="space-y-4">
      <h1
        className="text-xl font-semibold"
        style={{ color: 'var(--cn-text-primary)' }}
      >
        Music
      </h1>

      <MusicLibrary />

      {/* NowPlaying overlay */}
      {showNowPlaying && currentTrack && (
        <NowPlaying onClose={() => setShowNowPlaying(false)} />
      )}
    </div>
  );
}
