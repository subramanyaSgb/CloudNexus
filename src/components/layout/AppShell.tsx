'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MiniPlayer } from '@/components/music/MiniPlayer';
import { NowPlaying } from '@/components/music/NowPlaying';
import { usePlayerStore } from '@/stores/player';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden" style={{ backgroundColor: 'var(--cn-bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <TopBar />

        {/* Content area */}
        <main
          className="flex-1 overflow-y-auto p-4 cn-page-enter"
          style={{ backgroundColor: 'var(--cn-bg-primary)' }}
        >
          {children}
        </main>

        {/* Mini Player — shown when a track is loaded */}
        {currentTrack && (
          <MiniPlayer onExpand={() => setShowNowPlaying(true)} />
        )}
      </div>

      {/* Full NowPlaying overlay */}
      {showNowPlaying && currentTrack && (
        <NowPlaying onClose={() => setShowNowPlaying(false)} />
      )}
    </div>
  );
}
