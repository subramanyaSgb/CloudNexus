'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { UploadFAB } from './UploadFAB';
import { MiniPlayer } from '@/components/music/MiniPlayer';
import { NowPlaying } from '@/components/music/NowPlaying';
import { usePlayerStore } from '@/stores/player';
import { useIsMobile } from '@/hooks/useIsMobile';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isMobile = useIsMobile();

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden" style={{ backgroundColor: 'var(--cn-bg-primary)' }}>
      {/* Sidebar — hidden on mobile */}
      <div className="cn-desktop-only">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <TopBar />

        {/* Content area */}
        <main
          className={`flex-1 overflow-y-auto p-4 cn-page-enter ${isMobile ? 'pb-[120px]' : ''}`}
          style={{ backgroundColor: 'var(--cn-bg-primary)' }}
        >
          {children}
        </main>

        {/* Mini Player — shown when a track is loaded */}
        {currentTrack && (
          <MiniPlayer onExpand={() => setShowNowPlaying(true)} />
        )}

        {/* Bottom Nav — mobile only */}
        <div className="cn-mobile-only cn-safe-bottom">
          <BottomNav />
        </div>
      </div>

      {/* Upload FAB — always visible */}
      <UploadFAB />

      {/* Full NowPlaying overlay */}
      {showNowPlaying && currentTrack && (
        <NowPlaying onClose={() => setShowNowPlaying(false)} />
      )}
    </div>
  );
}
