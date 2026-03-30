'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FolderOpen,
  Image,
  Video,
  Music,
  MoreHorizontal,
  ArrowUpDown,
  Lock,
  Settings,
  X,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const PRIMARY_ITEMS: NavItem[] = [
  { label: 'Files', href: '/files', icon: FolderOpen },
  { label: 'Gallery', href: '/gallery', icon: Image },
  { label: 'Videos', href: '/videos', icon: Video },
  { label: 'Music', href: '/music', icon: Music },
];

const MORE_ITEMS: NavItem[] = [
  { label: 'Transfers', href: '/transfers', icon: ArrowUpDown },
  { label: 'Vault', href: '/vault', icon: Lock },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);

  const toggleMore = useCallback(() => {
    setMoreOpen((prev) => !prev);
  }, []);

  const closeMore = useCallback(() => {
    setMoreOpen(false);
  }, []);

  if (!isMobile) return null;

  const isMoreActive = MORE_ITEMS.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* More sheet overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeMore}
          aria-hidden="true"
        />
      )}

      {/* More slide-up sheet */}
      {moreOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t"
          style={{
            backgroundColor: 'var(--cn-bg-secondary)',
            borderColor: 'var(--cn-border)',
            paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
            animation: 'cn-slide-up 200ms ease-out',
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div
              className="rounded-full"
              style={{
                width: 36,
                height: 4,
                backgroundColor: 'var(--cn-border)',
              }}
            />
          </div>

          {/* Close button */}
          <div className="flex justify-end px-4 pb-1">
            <button
              onClick={closeMore}
              className="cn-interactive cn-focus-ring flex items-center justify-center rounded-full"
              style={{
                width: 36,
                height: 36,
                color: 'var(--cn-text-secondary)',
              }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* More items */}
          <nav className="px-2 pb-3">
            {MORE_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMore}
                  className="cn-interactive cn-focus-ring flex items-center gap-4 px-4 rounded-lg"
                  style={{
                    height: 56,
                    minHeight: 48,
                    color: isActive ? 'var(--cn-accent)' : 'var(--cn-text-primary)',
                    backgroundColor: isActive ? 'var(--cn-accent-glow)' : undefined,
                  }}
                >
                  <Icon size={22} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t"
        style={{
          height: 56,
          backgroundColor: 'var(--cn-bg-secondary)',
          borderColor: 'var(--cn-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {PRIMARY_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="cn-interactive cn-focus-ring flex flex-col items-center justify-center gap-0.5"
              style={{
                minWidth: 48,
                minHeight: 48,
                color: isActive ? 'var(--cn-accent)' : 'var(--cn-text-secondary)',
              }}
            >
              <Icon size={22} />
              <span style={{ fontSize: 10, lineHeight: '14px' }}>{item.label}</span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={toggleMore}
          className="cn-interactive cn-focus-ring flex flex-col items-center justify-center gap-0.5"
          style={{
            minWidth: 48,
            minHeight: 48,
            color: moreOpen || isMoreActive ? 'var(--cn-accent)' : 'var(--cn-text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label="More options"
        >
          <MoreHorizontal size={22} />
          <span style={{ fontSize: 10, lineHeight: '14px' }}>More</span>
        </button>
      </nav>

      {/* Slide-up animation */}
      <style jsx global>{`
        @keyframes cn-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
