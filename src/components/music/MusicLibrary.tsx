'use client';

import { useState, useEffect, useMemo } from 'react';
import { Music, Search, Disc3, User, ListMusic, Play } from 'lucide-react';
import { Input, EmptyState, Spinner } from '@/components/ui';
import { usePlayerStore } from '@/stores/player';
import { formatDuration } from '@/lib/utils/formatting';
import type { CNFile, CNMusicMeta } from '@/types';

type LibraryTab = 'songs' | 'albums' | 'artists' | 'playlists';

type SortField = 'title' | 'artist' | 'album' | 'duration';
type SortOrder = 'asc' | 'desc';

export function MusicLibrary() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const {
    musicLibrary,
    allMusicMeta,
    isLibraryLoaded,
    loadMusicLibrary,
    play,
    addToQueue,
    clearQueue,
  } = usePlayerStore();

  useEffect(() => {
    if (!isLibraryLoaded) {
      loadMusicLibrary();
    }
  }, [isLibraryLoaded, loadMusicLibrary]);

  const metaMap = useMemo(() => {
    const map = new Map<string, CNMusicMeta>();
    allMusicMeta.forEach((m) => map.set(m.fileId, m));
    return map;
  }, [allMusicMeta]);

  const filteredSongs = useMemo(() => {
    let songs = musicLibrary;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      songs = songs.filter((f) => {
        const meta = metaMap.get(f.id);
        return (
          f.name.toLowerCase().includes(q) ||
          meta?.title.toLowerCase().includes(q) ||
          meta?.artist.toLowerCase().includes(q) ||
          meta?.album.toLowerCase().includes(q)
        );
      });
    }
    return songs;
  }, [musicLibrary, searchQuery, metaMap]);

  const sortedSongs = useMemo(() => {
    const sorted = [...filteredSongs].sort((a, b) => {
      const metaA = metaMap.get(a.id);
      const metaB = metaMap.get(b.id);
      let cmp = 0;
      switch (sortField) {
        case 'title':
          cmp = (metaA?.title || a.name).localeCompare(metaB?.title || b.name);
          break;
        case 'artist':
          cmp = (metaA?.artist || '').localeCompare(metaB?.artist || '');
          break;
        case 'album':
          cmp = (metaA?.album || '').localeCompare(metaB?.album || '');
          break;
        case 'duration':
          cmp = (metaA?.duration || 0) - (metaB?.duration || 0);
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredSongs, sortField, sortOrder, metaMap]);

  // Group by album
  const albums = useMemo(() => {
    const albumMap = new Map<string, { name: string; artist: string; songs: CNFile[] }>();
    musicLibrary.forEach((f) => {
      const meta = metaMap.get(f.id);
      const albumName = meta?.album || 'Unknown Album';
      const artist = meta?.artist || 'Unknown Artist';
      const key = `${albumName}---${artist}`;
      if (!albumMap.has(key)) {
        albumMap.set(key, { name: albumName, artist, songs: [] });
      }
      albumMap.get(key)!.songs.push(f);
    });
    return Array.from(albumMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [musicLibrary, metaMap]);

  // Group by artist
  const artists = useMemo(() => {
    const artistMap = new Map<string, CNFile[]>();
    musicLibrary.forEach((f) => {
      const meta = metaMap.get(f.id);
      const artist = meta?.artist || 'Unknown Artist';
      if (!artistMap.has(artist)) {
        artistMap.set(artist, []);
      }
      artistMap.get(artist)!.push(f);
    });
    return Array.from(artistMap.entries())
      .map(([name, songs]) => ({ name, songs }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [musicLibrary, metaMap]);

  function handlePlaySong(file: CNFile) {
    // Set up queue with all filtered songs, play the selected one
    clearQueue();
    const allSongs = activeTab === 'songs' ? sortedSongs : filteredSongs;
    allSongs.forEach((s) => addToQueue(s));
    const index = allSongs.findIndex((s) => s.id === file.id);
    if (index >= 0) {
      usePlayerStore.getState().playFromQueue(index);
    } else {
      play(file);
    }
  }

  function handlePlayAlbum(songs: CNFile[]) {
    clearQueue();
    songs.forEach((s) => addToQueue(s));
    if (songs.length > 0) {
      usePlayerStore.getState().playFromQueue(0);
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  if (!isLibraryLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  if (musicLibrary.length === 0) {
    return (
      <EmptyState
        icon={Music}
        title="No music yet"
        description="Upload audio files to build your music library. Supported formats include MP3, FLAC, AAC, and more."
      />
    );
  }

  const TABS: { key: LibraryTab; label: string; icon: React.ReactNode }[] = [
    { key: 'songs', label: 'All Songs', icon: <ListMusic size={14} /> },
    { key: 'albums', label: 'Albums', icon: <Disc3 size={14} /> },
    { key: 'artists', label: 'Artists', icon: <User size={14} /> },
  ];

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? ' \u2191' : ' \u2193';
  };

  return (
    <div className="space-y-4">
      {/* Tab bar + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className="cn-interactive flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-colors"
              style={{
                backgroundColor:
                  activeTab === tab.key ? 'var(--cn-accent)' : 'transparent',
                color:
                  activeTab === tab.key ? '#FFFFFF' : 'var(--cn-text-secondary)',
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto max-w-xs w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--cn-text-secondary)' }}
          />
          <Input
            placeholder="Search music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'songs' && (
        <SongsList
          songs={sortedSongs}
          metaMap={metaMap}
          onPlay={handlePlaySong}
          onSort={handleSort}
          sortIndicator={sortIndicator}
        />
      )}

      {activeTab === 'albums' && (
        <AlbumsGrid albums={albums} onPlayAlbum={handlePlayAlbum} />
      )}

      {activeTab === 'artists' && (
        <ArtistsList artists={artists} metaMap={metaMap} onPlay={handlePlaySong} />
      )}
    </div>
  );
}

/* ---------- Songs List ---------- */

interface SongsListProps {
  songs: CNFile[];
  metaMap: Map<string, CNMusicMeta>;
  onPlay: (file: CNFile) => void;
  onSort: (field: SortField) => void;
  sortIndicator: (field: SortField) => string | null;
}

function SongsList({ songs, metaMap, onPlay, onSort, sortIndicator }: SongsListProps) {
  if (songs.length === 0) {
    return <EmptyState icon={Search} title="No songs found" />;
  }

  return (
    <div className="cn-panel" style={{ padding: 0 }}>
      {/* Header */}
      <div
        className="grid gap-4 px-4 py-2 text-xs font-medium border-b"
        style={{
          gridTemplateColumns: '2fr 1.5fr 1.5fr 80px 60px',
          color: 'var(--cn-text-secondary)',
          borderColor: 'var(--cn-border)',
        }}
      >
        <button className="text-left hover:underline" onClick={() => onSort('title')}>
          Title{sortIndicator('title')}
        </button>
        <button className="text-left hover:underline" onClick={() => onSort('artist')}>
          Artist{sortIndicator('artist')}
        </button>
        <button className="text-left hover:underline" onClick={() => onSort('album')}>
          Album{sortIndicator('album')}
        </button>
        <button className="text-left hover:underline" onClick={() => onSort('duration')}>
          Duration{sortIndicator('duration')}
        </button>
        <span className="text-right">Plays</span>
      </div>

      {/* Song rows */}
      <div className="max-h-[60vh] overflow-y-auto">
        {songs.map((song) => {
          const meta = metaMap.get(song.id);
          return (
            <button
              key={song.id}
              className="grid gap-4 px-4 py-2.5 w-full text-left cn-interactive group"
              style={{
                gridTemplateColumns: '2fr 1.5fr 1.5fr 80px 60px',
                borderBottom: '1px solid var(--cn-border)',
              }}
              onClick={() => onPlay(song)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Play
                  size={14}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--cn-accent)' }}
                />
                <span
                  className="text-sm truncate"
                  style={{ color: 'var(--cn-text-primary)' }}
                >
                  {meta?.title || song.name}
                </span>
              </div>
              <span
                className="text-sm truncate"
                style={{ color: 'var(--cn-text-secondary)' }}
              >
                {meta?.artist || 'Unknown'}
              </span>
              <span
                className="text-sm truncate"
                style={{ color: 'var(--cn-text-secondary)' }}
              >
                {meta?.album || 'Unknown'}
              </span>
              <span
                className="text-xs font-mono"
                style={{ color: 'var(--cn-text-secondary)' }}
              >
                {meta?.duration ? formatDuration(meta.duration) : '--:--'}
              </span>
              <span
                className="text-xs text-right"
                style={{
                  color: (meta?.playCount ?? 0) > 0
                    ? 'var(--cn-accent)'
                    : 'var(--cn-text-secondary)',
                }}
              >
                {(meta?.playCount ?? 0) > 0 ? meta!.playCount : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Albums Grid ---------- */

interface AlbumsGridProps {
  albums: { name: string; artist: string; songs: CNFile[] }[];
  onPlayAlbum: (songs: CNFile[]) => void;
}

function AlbumsGrid({ albums, onPlayAlbum }: AlbumsGridProps) {
  if (albums.length === 0) {
    return <EmptyState icon={Disc3} title="No albums found" />;
  }

  // Generate a deterministic color from album name
  function albumColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 50%, 35%)`;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {albums.map((album) => (
        <button
          key={`${album.name}---${album.artist}`}
          className="cn-panel cn-interactive text-left group"
          style={{ padding: 0 }}
          onClick={() => onPlayAlbum(album.songs)}
        >
          {/* Album art placeholder */}
          <div
            className="aspect-square w-full flex items-center justify-center relative"
            style={{ backgroundColor: albumColor(album.name), borderRadius: 'var(--cn-radius-md) var(--cn-radius-md) 0 0' }}
          >
            <Disc3 size={40} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--cn-accent)' }}
              >
                <Play size={18} fill="#FFFFFF" color="#FFFFFF" />
              </div>
            </div>
          </div>
          <div className="p-3">
            <h3
              className="text-sm font-medium truncate"
              style={{ color: 'var(--cn-text-primary)' }}
            >
              {album.name}
            </h3>
            <p
              className="text-xs truncate"
              style={{ color: 'var(--cn-text-secondary)' }}
            >
              {album.artist} &middot; {album.songs.length} song{album.songs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------- Artists List ---------- */

interface ArtistsListProps {
  artists: { name: string; songs: CNFile[] }[];
  metaMap: Map<string, CNMusicMeta>;
  onPlay: (file: CNFile) => void;
}

function ArtistsList({ artists, metaMap, onPlay }: ArtistsListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (artists.length === 0) {
    return <EmptyState icon={User} title="No artists found" />;
  }

  return (
    <div className="space-y-1">
      {artists.map((artist) => (
        <div key={artist.name} className="cn-panel" style={{ padding: 0 }}>
          <button
            className="w-full flex items-center justify-between px-4 py-3 cn-interactive"
            onClick={() => setExpanded(expanded === artist.name ? null : artist.name)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--cn-bg-tertiary)' }}
              >
                <User size={14} style={{ color: 'var(--cn-text-secondary)' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--cn-text-primary)' }}>
                {artist.name}
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
              {artist.songs.length} song{artist.songs.length !== 1 ? 's' : ''}
            </span>
          </button>

          {expanded === artist.name && (
            <div style={{ borderTop: '1px solid var(--cn-border)' }}>
              {artist.songs.map((song) => {
                const meta = metaMap.get(song.id);
                return (
                  <button
                    key={song.id}
                    className="w-full flex items-center justify-between px-6 py-2 cn-interactive"
                    onClick={() => onPlay(song)}
                  >
                    <span className="text-sm truncate" style={{ color: 'var(--cn-text-primary)' }}>
                      {meta?.title || song.name}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--cn-text-secondary)' }}>
                      {meta?.duration ? formatDuration(meta.duration) : '--:--'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
