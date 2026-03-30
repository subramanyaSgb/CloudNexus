import { create } from 'zustand';
import type { CNFile, CNFolder } from '@/types';
import * as fileOps from '@/lib/db/files';
import * as folderOps from '@/lib/db/folders';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'size' | 'createdAt' | 'updatedAt' | 'mime';
type SortOrder = 'asc' | 'desc';

interface FilesStoreState {
  // Current navigation
  currentPath: string;
  files: CNFile[];
  folders: CNFolder[];

  // View
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedIds: Set<string>;

  // Search
  searchQuery: string;
  searchResults: CNFile[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  navigateTo: (path: string) => Promise<void>;
  refreshCurrentFolder: () => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setSorting: (by: SortBy, order: SortOrder) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useFilesStore = create<FilesStoreState>((set, get) => ({
  currentPath: '/',
  files: [],
  folders: [],
  viewMode: 'grid',
  sortBy: 'name',
  sortOrder: 'asc',
  selectedIds: new Set<string>(),
  searchQuery: '',
  searchResults: [],
  isLoading: false,
  error: null,

  navigateTo: async (path: string) => {
    set({ isLoading: true, error: null, selectedIds: new Set() });
    try {
      await folderOps.ensureRootFolder();
      const [files, folders] = await Promise.all([
        fileOps.getFilesByFolder(path),
        folderOps.getChildFolders(path),
      ]);
      set({ currentPath: path, files, folders, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load folder',
        isLoading: false,
      });
    }
  },

  refreshCurrentFolder: async () => {
    const { currentPath } = get();
    const [files, folders] = await Promise.all([
      fileOps.getFilesByFolder(currentPath),
      folderOps.getChildFolders(currentPath),
    ]);
    set({ files, folders });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setSorting: (by, order) => set({ sortBy: by, sortOrder: order }),

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
    const { files, folders } = get();
    const allIds = new Set([
      ...files.map((f) => f.id),
      ...folders.map((f) => f.id),
    ]);
    set({ selectedIds: allIds });
  },

  clearSelection: () => set({ selectedIds: new Set() }),

  search: async (query) => {
    if (!query.trim()) {
      set({ searchQuery: '', searchResults: [] });
      return;
    }
    set({ searchQuery: query });
    const results = await fileOps.searchFiles(query);
    set({ searchResults: results });
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),
}));
