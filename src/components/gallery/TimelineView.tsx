'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CNFile } from '@/types';
import { GalleryGrid } from './GalleryGrid';

interface TimelineViewProps {
  files: CNFile[];
  selectedIds: Set<string>;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onOpen: (index: number) => void;
}

interface TimelineGroup {
  label: string;
  key: string;
  files: CNFile[];
  /** Global start index in the flat files array for lightbox indexing */
  startIndex: number;
}

function getGroupLabel(date: Date, now: Date): { label: string; key: string } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return { label: 'Today', key: 'today' };
  if (diffDays === 1) return { label: 'Yesterday', key: 'yesterday' };
  if (diffDays < 7) return { label: 'This Week', key: 'this-week' };

  const sameMonth =
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  if (sameMonth) return { label: 'This Month', key: 'this-month' };

  const monthYear = date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return { label: monthYear, key: monthYear };
}

function buildGroups(files: CNFile[]): TimelineGroup[] {
  const now = new Date();
  const groupMap = new Map<string, { label: string; files: CNFile[] }>();
  const groupOrder: string[] = [];

  for (const file of files) {
    const { label, key } = getGroupLabel(new Date(file.createdAt), now);
    if (!groupMap.has(key)) {
      groupMap.set(key, { label, files: [] });
      groupOrder.push(key);
    }
    groupMap.get(key)!.files.push(file);
  }

  let runningIndex = 0;
  return groupOrder.map((key) => {
    const { label, files: groupFiles } = groupMap.get(key)!;
    const group: TimelineGroup = {
      label,
      key,
      files: groupFiles,
      startIndex: runningIndex,
    };
    runningIndex += groupFiles.length;
    return group;
  });
}

function TimelineGroupSection({
  group,
  selectedIds,
  selectionMode,
  onSelect,
  onOpen,
}: {
  group: TimelineGroup;
  selectedIds: Set<string>;
  selectionMode: boolean;
  onSelect: (id: string) => void;
  onOpen: (index: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const handleOpen = (localIndex: number) => {
    onOpen(group.startIndex + localIndex);
  };

  return (
    <div className="mb-4">
      <button
        className="flex items-center gap-2 w-full px-3 py-2 cn-interactive"
        style={{
          color: 'var(--cn-text-primary)',
          borderBottom: '1px solid var(--cn-border)',
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        <span className="text-sm font-semibold">{group.label}</span>
        <span
          className="text-xs ml-auto"
          style={{ color: 'var(--cn-text-secondary)' }}
        >
          {group.files.length} {group.files.length === 1 ? 'item' : 'items'}
        </span>
      </button>
      {!collapsed && (
        <GalleryGrid
          files={group.files}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          onSelect={onSelect}
          onOpen={handleOpen}
        />
      )}
    </div>
  );
}

export function TimelineView({
  files,
  selectedIds,
  selectionMode,
  onSelect,
  onOpen,
}: TimelineViewProps) {
  const groups = useMemo(() => buildGroups(files), [files]);

  return (
    <div className="w-full">
      {groups.map((group) => (
        <TimelineGroupSection
          key={group.key}
          group={group}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          onSelect={onSelect}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
