'use client';

import { Home, ChevronRight } from 'lucide-react';
import { useFilesStore } from '@/stores/files';

export function Breadcrumb() {
  const { currentPath, navigateTo } = useFilesStore();

  const segments = currentPath === '/'
    ? []
    : currentPath.split('/').filter(Boolean);

  const buildPath = (index: number): string => {
    return '/' + segments.slice(0, index + 1).join('/');
  };

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        fontSize: '14px',
        minHeight: '32px',
        flexWrap: 'wrap',
      }}
    >
      {/* Home / root */}
      {segments.length === 0 ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--cn-radius-sm)',
            color: 'var(--cn-text-primary)',
            fontWeight: 500,
          }}
        >
          <Home size={15} />
          <span>Home</span>
        </span>
      ) : (
        <button
          onClick={() => navigateTo('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--cn-radius-sm)',
            color: 'var(--cn-text-secondary)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'color var(--cn-transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--cn-accent)';
            e.currentTarget.style.backgroundColor = 'var(--cn-bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--cn-text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Home size={15} />
        </button>
      )}

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <span key={buildPath(index)} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <ChevronRight size={14} style={{ color: 'var(--cn-text-secondary)', opacity: 0.5 }} />
            {isLast ? (
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--cn-radius-sm)',
                  color: 'var(--cn-text-primary)',
                  fontWeight: 500,
                }}
              >
                {segment}
              </span>
            ) : (
              <button
                onClick={() => navigateTo(buildPath(index))}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--cn-radius-sm)',
                  color: 'var(--cn-text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'color var(--cn-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--cn-accent)';
                  e.currentTarget.style.backgroundColor = 'var(--cn-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--cn-text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {segment}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
