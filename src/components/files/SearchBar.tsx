'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useFilesStore } from '@/stores/files';
import { formatFileSize } from '@/lib/utils/formatting';

type FilterType = 'all' | 'images' | 'videos' | 'audio' | 'documents';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'All',
  images: 'Images',
  videos: 'Videos',
  audio: 'Audio',
  documents: 'Documents',
};

const FILTER_MIME_PREFIXES: Record<Exclude<FilterType, 'all'>, string[]> = {
  images: ['image/'],
  videos: ['video/'],
  audio: ['audio/'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats',
    'application/vnd.ms-',
    'text/',
    'application/rtf',
  ],
};

export function SearchBar() {
  const { searchQuery, searchResults, search, clearSearch } = useFilesStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Expose focus method via Ctrl+K or "/"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.ctrlKey || e.metaKey)) ||
        (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement))
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      search(localQuery);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localQuery, search]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    setActiveFilter('all');
    clearSearch();
    inputRef.current?.focus();
  }, [clearSearch]);

  const filteredResults = activeFilter === 'all'
    ? searchResults
    : searchResults.filter((file) =>
        FILTER_MIME_PREFIXES[activeFilter].some((prefix) =>
          file.mime.startsWith(prefix)
        )
      );

  const isActive = localQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search input */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{
          backgroundColor: 'var(--cn-bg-tertiary)',
          border: '1px solid var(--cn-border)',
          borderRadius: 'var(--cn-radius-md)',
          transition: 'border-color var(--cn-transition-fast)',
        }}
      >
        <Search size={16} style={{ color: 'var(--cn-text-muted)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search files... (Ctrl+K)"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: 'var(--cn-text-primary)' }}
        />
        {isActive && (
          <button
            onClick={handleClear}
            className="cn-interactive cn-focus-ring p-0.5 rounded"
            style={{ color: 'var(--cn-text-muted)' }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter buttons */}
      {isActive && (
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="cn-interactive cn-focus-ring px-3 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor:
                  activeFilter === filter ? 'var(--cn-accent)' : 'var(--cn-bg-tertiary)',
                color: activeFilter === filter ? '#FFFFFF' : 'var(--cn-text-secondary)',
                border: `1px solid ${activeFilter === filter ? 'var(--cn-accent)' : 'var(--cn-border)'}`,
                borderRadius: '9999px',
                transition: 'all var(--cn-transition-fast)',
              }}
            >
              {FILTER_LABELS[filter]}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {isActive && (
        <div className="flex flex-col gap-1">
          <span className="text-xs" style={{ color: 'var(--cn-text-muted)' }}>
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
          </span>

          {filteredResults.length > 0 && (
            <div
              className="flex flex-col gap-0.5 max-h-64 overflow-y-auto rounded-md"
              style={{
                backgroundColor: 'var(--cn-bg-secondary)',
                border: '1px solid var(--cn-border)',
                borderRadius: 'var(--cn-radius-md)',
              }}
            >
              {filteredResults.map((file) => (
                <div
                  key={file.id}
                  className="cn-interactive flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span
                    className="truncate flex-1"
                    style={{ color: 'var(--cn-text-primary)' }}
                  >
                    {file.name}
                  </span>
                  <span
                    className="text-xs ml-2 shrink-0"
                    style={{ color: 'var(--cn-text-muted)' }}
                  >
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
