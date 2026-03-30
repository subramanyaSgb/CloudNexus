'use client';

import { useEffect, useState } from 'react';
import {
  Image,
  Grid3X3,
  Clock,
  FolderHeart,
  CheckSquare,
  X,
  Trash2,
  Download,
  Plus,
  FolderPlus,
} from 'lucide-react';
import { useGalleryStore } from '@/stores/gallery';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { TimelineView } from '@/components/gallery/TimelineView';
import { Lightbox } from '@/components/gallery/Lightbox';
import { Button, EmptyState, Spinner, Modal } from '@/components/ui';

const VIEW_ICONS = {
  grid: Grid3X3,
  timeline: Clock,
  albums: FolderHeart,
} as const;

export default function GalleryPage() {
  const {
    imageFiles,
    viewMode,
    selectedIds,
    selectionMode,
    lightboxOpen,
    lightboxIndex,
    albums,
    isLoading,
    error,
    loadImages,
    setViewMode,
    toggleSelection,
    selectAll,
    clearSelection,
    setSelectionMode,
    openLightbox,
    closeLightbox,
    nextImage,
    prevImage,
    toggleStar,
    deleteSelected,
    createAlbum,
    addToAlbum,
  } = useGalleryStore();

  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [addToAlbumOpen, setAddToAlbumOpen] = useState(false);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleCreateAlbum = () => {
    if (newAlbumName.trim()) {
      createAlbum(newAlbumName.trim());
      setNewAlbumName('');
      setAlbumModalOpen(false);
    }
  };

  const handleAddToAlbum = (albumId: string) => {
    addToAlbum(albumId, Array.from(selectedIds));
    setAddToAlbumOpen(false);
    clearSelection();
  };

  // Get files for album view
  const activeAlbum = albums.find((a) => a.id === activeAlbumId);
  const albumFiles = activeAlbum
    ? imageFiles.filter((f) => activeAlbum.fileIds.includes(f.id))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-sm" style={{ color: 'var(--cn-danger)' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--cn-bg-primary)' }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0 border-b"
        style={{
          backgroundColor: 'var(--cn-bg-secondary)',
          borderColor: 'var(--cn-border)',
        }}
      >
        <div className="flex items-center gap-1">
          {(Object.keys(VIEW_ICONS) as Array<keyof typeof VIEW_ICONS>).map((mode) => {
            const Icon = VIEW_ICONS[mode];
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                className="p-2 rounded-md cn-interactive capitalize text-xs flex items-center gap-1.5"
                style={{
                  backgroundColor: active ? 'var(--cn-bg-tertiary)' : 'transparent',
                  color: active ? 'var(--cn-text-primary)' : 'var(--cn-text-secondary)',
                }}
                onClick={() => {
                  setViewMode(mode);
                  setActiveAlbumId(null);
                }}
                title={mode}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{mode}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {selectionMode ? (
            <>
              <span className="text-xs" style={{ color: 'var(--cn-text-secondary)' }}>
                {selectedIds.size} selected
              </span>
              <Button size="sm" variant="ghost" onClick={selectAll}>
                Select All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => clearSelection()}
              >
                <X size={14} />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectionMode(true)}
            >
              <CheckSquare size={14} />
              <span className="hidden sm:inline">Select</span>
            </Button>
          )}
        </div>
      </div>

      {/* Batch actions toolbar */}
      {selectionMode && selectedIds.size > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-2 shrink-0 border-b"
          style={{
            backgroundColor: 'var(--cn-bg-tertiary)',
            borderColor: 'var(--cn-border)',
          }}
        >
          <Button size="sm" variant="ghost" onClick={() => {}}>
            <Download size={14} />
            Download
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={deleteSelected}
          >
            <Trash2 size={14} />
            Delete
          </Button>
          {albums.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAddToAlbumOpen(true)}
            >
              <Plus size={14} />
              Add to Album
            </Button>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {imageFiles.length === 0 ? (
          <EmptyState
            icon={Image}
            title="No photos or videos"
            description="Upload images and videos to see them here."
          />
        ) : viewMode === 'grid' ? (
          <GalleryGrid
            files={imageFiles}
            selectedIds={selectedIds}
            selectionMode={selectionMode}
            onSelect={toggleSelection}
            onOpen={openLightbox}
          />
        ) : viewMode === 'timeline' ? (
          <TimelineView
            files={imageFiles}
            selectedIds={selectedIds}
            selectionMode={selectionMode}
            onSelect={toggleSelection}
            onOpen={openLightbox}
          />
        ) : (
          /* Albums view */
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold"
                style={{ color: 'var(--cn-text-primary)' }}
              >
                {activeAlbum ? activeAlbum.name : 'Albums'}
              </h2>
              <div className="flex items-center gap-2">
                {activeAlbum && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveAlbumId(null)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setAlbumModalOpen(true)}
                >
                  <FolderPlus size={14} />
                  New Album
                </Button>
              </div>
            </div>

            {activeAlbum ? (
              albumFiles.length === 0 ? (
                <EmptyState
                  icon={FolderHeart}
                  title="Album is empty"
                  description="Select photos and use 'Add to Album' to add them here."
                />
              ) : (
                <GalleryGrid
                  files={albumFiles}
                  selectedIds={selectedIds}
                  selectionMode={selectionMode}
                  onSelect={toggleSelection}
                  onOpen={(index) => {
                    // Find the global index for lightbox
                    const globalIndex = imageFiles.findIndex(
                      (f) => f.id === albumFiles[index]?.id
                    );
                    if (globalIndex !== -1) openLightbox(globalIndex);
                  }}
                />
              )
            ) : albums.length === 0 ? (
              <EmptyState
                icon={FolderHeart}
                title="No albums yet"
                description="Create albums to organize your photos and videos."
                action={
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setAlbumModalOpen(true)}
                  >
                    <FolderPlus size={14} />
                    Create Album
                  </Button>
                }
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                {albums.map((album) => {
                  const coverFile = imageFiles.find((f) =>
                    album.fileIds.includes(f.id)
                  );
                  return (
                    <button
                      key={album.id}
                      className="text-left rounded-lg overflow-hidden cn-interactive"
                      style={{
                        backgroundColor: 'var(--cn-bg-secondary)',
                        border: '1px solid var(--cn-border)',
                        borderRadius: 'var(--cn-radius-md)',
                      }}
                      onClick={() => setActiveAlbumId(album.id)}
                    >
                      <div
                        className="w-full flex items-center justify-center"
                        style={{
                          aspectRatio: '16/10',
                          backgroundColor: coverFile
                            ? 'var(--cn-accent)'
                            : 'var(--cn-bg-tertiary)',
                          opacity: coverFile ? 0.6 : 1,
                        }}
                      >
                        <FolderHeart
                          size={32}
                          style={{
                            color: coverFile
                              ? '#fff'
                              : 'var(--cn-text-secondary)',
                            opacity: 0.5,
                          }}
                        />
                      </div>
                      <div className="p-3">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--cn-text-primary)' }}
                        >
                          {album.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--cn-text-secondary)' }}
                        >
                          {album.fileIds.length}{' '}
                          {album.fileIds.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        files={imageFiles}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
        onToggleStar={toggleStar}
      />

      {/* Create Album Modal */}
      <Modal
        open={albumModalOpen}
        onClose={() => setAlbumModalOpen(false)}
        title="Create Album"
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Album name"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateAlbum();
            }}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={{
              backgroundColor: 'var(--cn-bg-secondary)',
              color: 'var(--cn-text-primary)',
              border: '1px solid var(--cn-border)',
              borderRadius: 'var(--cn-radius-md)',
              outline: 'none',
            }}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAlbumModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleCreateAlbum}
              disabled={!newAlbumName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add to Album Modal */}
      <Modal
        open={addToAlbumOpen}
        onClose={() => setAddToAlbumOpen(false)}
        title="Add to Album"
      >
        <div className="flex flex-col gap-2">
          {albums.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--cn-text-secondary)' }}>
              No albums. Create one first.
            </p>
          ) : (
            albums.map((album) => (
              <button
                key={album.id}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md cn-interactive text-left"
                style={{
                  backgroundColor: 'var(--cn-bg-secondary)',
                  color: 'var(--cn-text-primary)',
                  border: '1px solid var(--cn-border)',
                  borderRadius: 'var(--cn-radius-md)',
                }}
                onClick={() => handleAddToAlbum(album.id)}
              >
                <FolderHeart size={16} style={{ color: 'var(--cn-accent)' }} />
                <span className="text-sm">{album.name}</span>
                <span
                  className="ml-auto text-xs"
                  style={{ color: 'var(--cn-text-secondary)' }}
                >
                  {album.fileIds.length} items
                </span>
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
