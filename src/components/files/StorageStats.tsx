'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { db } from '@/lib/db/schema';
import { formatFileSize } from '@/lib/utils/formatting';

interface CategoryStat {
  label: string;
  color: string;
  count: number;
  size: number;
}

type CategoryKey = 'images' | 'videos' | 'audio' | 'documents' | 'other';

const CATEGORY_CONFIG: Record<CategoryKey, { label: string; color: string; prefixes: string[] }> = {
  images: { label: 'Images', color: '#8B5CF6', prefixes: ['image/'] },
  videos: { label: 'Videos', color: '#3B82F6', prefixes: ['video/'] },
  audio: { label: 'Audio', color: '#10B981', prefixes: ['audio/'] },
  documents: {
    label: 'Documents',
    color: '#F59E0B',
    prefixes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats', 'application/vnd.ms-', 'text/', 'application/rtf'],
  },
  other: { label: 'Other', color: '#6B7280', prefixes: [] },
};

function getCategory(mime: string): CategoryKey {
  for (const [key, config] of Object.entries(CATEGORY_CONFIG) as [CategoryKey, typeof CATEGORY_CONFIG[CategoryKey]][]) {
    if (key === 'other') continue;
    if (config.prefixes.some((prefix) => mime.startsWith(prefix))) {
      return key;
    }
  }
  return 'other';
}

export function StorageStats() {
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function computeStats() {
      setIsLoading(true);
      try {
        const allFiles = await db.files.filter((f) => !f.deleted).toArray();

        const totals: Record<CategoryKey, { count: number; size: number }> = {
          images: { count: 0, size: 0 },
          videos: { count: 0, size: 0 },
          audio: { count: 0, size: 0 },
          documents: { count: 0, size: 0 },
          other: { count: 0, size: 0 },
        };

        let sumSize = 0;
        for (const file of allFiles) {
          const cat = getCategory(file.mime);
          totals[cat].count += 1;
          totals[cat].size += file.size;
          sumSize += file.size;
        }

        const stats: CategoryStat[] = (Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((key) => ({
          label: CATEGORY_CONFIG[key].label,
          color: CATEGORY_CONFIG[key].color,
          count: totals[key].count,
          size: totals[key].size,
        }));

        setTotalFiles(allFiles.length);
        setTotalSize(sumSize);
        setCategories(stats);
      } catch {
        // Silently handle - stats are non-critical
      } finally {
        setIsLoading(false);
      }
    }

    computeStats();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-6">
          <span className="text-sm" style={{ color: 'var(--cn-text-muted)' }}>
            Loading storage stats...
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-4">
        {/* Header stats */}
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            Storage Overview
          </h3>
          <span className="text-xs" style={{ color: 'var(--cn-text-muted)' }}>
            {totalFiles} file{totalFiles !== 1 ? 's' : ''} &middot; {formatFileSize(totalSize)}
          </span>
        </div>

        {/* Stacked bar */}
        <div
          className="flex w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--cn-bg-secondary)' }}
        >
          {categories.map((cat) => {
            const pct = totalSize > 0 ? (cat.size / totalSize) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={cat.label}
                style={{
                  width: `${pct}%`,
                  backgroundColor: cat.color,
                  minWidth: pct > 0 ? '2px' : 0,
                  transition: 'width 300ms ease-out',
                }}
                title={`${cat.label}: ${formatFileSize(cat.size)}`}
              />
            );
          })}
        </div>

        {/* Category breakdown */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <div className="flex flex-col min-w-0">
                <span
                  className="text-xs font-medium truncate"
                  style={{ color: 'var(--cn-text-primary)' }}
                >
                  {cat.label}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--cn-text-muted)' }}>
                  {cat.count} file{cat.count !== 1 ? 's' : ''} &middot; {formatFileSize(cat.size)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
