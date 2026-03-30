import { create } from 'zustand';
import type { CNFile } from '@/types';
import { db } from '@/lib/db/schema';
import { isImage, isVideo } from '@/lib/utils/mime';
import { starFile, softDeleteFile } from '@/lib/db/files';

type ViewMode = 'grid' | 'timeline' | 'albums';

interface Album {
  id: string;
  name: string;
  fileIds: string[];
}

interface GalleryStoreState {
  // Data
  imageFiles: CNFile[];
  albums: Album[];

  // View
  viewMode: ViewMode;
  selectedIds: Set<string>;
  selectionMode: boolean;

  // Lightbox
  lightboxOpen: boolean;
  lightboxIndex: number;

  // Loading
  isLoading: boolean;
  error: string | null;

  // Actions
  loadImages: () => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setSelectionMode: (enabled: boolean) => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  nextImage: () => void;
  prevImage: () => void;
  toggleStar: (id: string) => Promise<void>;
  deleteSelected: () => Promise<void>;

  // Album actions
  createAlbum: (name: string) => void;
  deleteAlbum: (albumId: string) => void;
  addToAlbum: (albumId: string, fileIds: string[]) => void;
  removeFromAlbum: (albumId: string, fileIds: string[]) => void;
}

let albumCounter = 0;

export const useGalleryStore = create<GalleryStoreState>((set, get) => ({
  imageFiles: [],
  albums: [],
  viewMode: 'grid',
  selectedIds: new Set<string>(),
  selectionMode: false,
  lightboxOpen: false,
  lightboxIndex: 0,
  isLoading: false,
  error: null,

  loadImages: async () => {
    set({ isLoading: true, error: null });
    try {
      const files = await db.files
        .filter((f) => !f.deleted && (isImage(f.mime) || isVideo(f.mime)))
        .toArray();
      files.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      set({ imageFiles: files, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load gallery',
        isLoading: false,
      });
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleSelection: (id) => {
    const selected = new Set(get().selectedIds);
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    set({ selectedIds: selected });
  },

  selectAll: () => {
    const allIds = new Set(get().imageFiles.map((f) => f.id));
    set({ selectedIds: allIds });
  },

  clearSelection: () => set({ selectedIds: new Set(), selectionMode: false }),

  setSelectionMode: (enabled) => {
    set({ selectionMode: enabled });
    if (!enabled) set({ selectedIds: new Set() });
  },

  openLightbox: (index) => set({ lightboxOpen: true, lightboxIndex: index }),

  closeLightbox: () => set({ lightboxOpen: false }),

  nextImage: () => {
    const { lightboxIndex, imageFiles } = get();
    if (lightboxIndex < imageFiles.length - 1) {
      set({ lightboxIndex: lightboxIndex + 1 });
    }
  },

  prevImage: () => {
    const { lightboxIndex } = get();
    if (lightboxIndex > 0) {
      set({ lightboxIndex: lightboxIndex - 1 });
    }
  },

  toggleStar: async (id) => {
    const file = get().imageFiles.find((f) => f.id === id);
    if (!file) return;
    const newStarred = !file.starred;
    await starFile(id, newStarred);
    set({
      imageFiles: get().imageFiles.map((f) =>
        f.id === id ? { ...f, starred: newStarred } : f
      ),
    });
  },

  deleteSelected: async () => {
    const { selectedIds } = get();
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => softDeleteFile(id)));
    set({
      imageFiles: get().imageFiles.filter((f) => !selectedIds.has(f.id)),
      selectedIds: new Set(),
      selectionMode: false,
    });
  },

  createAlbum: (name) => {
    albumCounter += 1;
    const album: Album = {
      id: `album_${Date.now()}_${albumCounter}`,
      name,
      fileIds: [],
    };
    set({ albums: [...get().albums, album] });
  },

  deleteAlbum: (albumId) => {
    set({ albums: get().albums.filter((a) => a.id !== albumId) });
  },

  addToAlbum: (albumId, fileIds) => {
    set({
      albums: get().albums.map((a) =>
        a.id === albumId
          ? { ...a, fileIds: [...new Set([...a.fileIds, ...fileIds])] }
          : a
      ),
    });
  },

  removeFromAlbum: (albumId, fileIds) => {
    const removeSet = new Set(fileIds);
    set({
      albums: get().albums.map((a) =>
        a.id === albumId
          ? { ...a, fileIds: a.fileIds.filter((id) => !removeSet.has(id)) }
          : a
      ),
    });
  },
}));
