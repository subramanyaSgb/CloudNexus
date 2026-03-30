'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FolderOpen,
  Image,
  Video,
  Music,
  ArrowUpDown,
  Lock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cloud,
} from 'lucide-react';
import type { AppModule } from '@/types';

interface NavItem {
  module: AppModule;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { module: 'files', label: 'Files', href: '/files', icon: FolderOpen },
  { module: 'gallery', label: 'Gallery', href: '/gallery', icon: Image },
  { module: 'videos', label: 'Videos', href: '/videos', icon: Video },
  { module: 'music', label: 'Music', href: '/music', icon: Music },
  { module: 'transfers', label: 'Transfers', href: '/transfers', icon: ArrowUpDown },
  { module: 'vault', label: 'Vault', href: '/vault', icon: Lock },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="cn-sidebar flex flex-col border-r"
      style={{
        width: collapsed ? 'var(--cn-sidebar-collapsed-width)' : 'var(--cn-sidebar-width)',
        backgroundColor: 'var(--cn-bg-secondary)',
        borderColor: 'var(--cn-border)',
        transition: 'width var(--cn-transition-normal)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-4 border-b"
        style={{
          height: 'var(--cn-topbar-height)',
          borderColor: 'var(--cn-border)',
        }}
      >
        <Cloud size={24} style={{ color: 'var(--cn-accent)' }} />
        {!collapsed && (
          <span className="font-bold text-lg" style={{ color: 'var(--cn-text-primary)' }}>
            CloudNexus
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.module}
              href={item.href}
              className="cn-interactive cn-focus-ring flex items-center gap-3 mx-2 px-3 py-2 rounded-md"
              style={{
                backgroundColor: isActive ? 'var(--cn-accent-glow)' : undefined,
                color: isActive ? 'var(--cn-accent)' : 'var(--cn-text-secondary)',
                borderLeft: isActive ? '2px solid var(--cn-accent)' : '2px solid transparent',
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t py-2" style={{ borderColor: 'var(--cn-border)' }}>
        <Link
          href="/settings"
          className="cn-interactive cn-focus-ring flex items-center gap-3 mx-2 px-3 py-2 rounded-md"
          style={{
            color: pathname.startsWith('/settings')
              ? 'var(--cn-accent)'
              : 'var(--cn-text-secondary)',
          }}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={20} />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="cn-interactive cn-focus-ring flex items-center justify-center py-3 border-t"
        style={{ borderColor: 'var(--cn-border)', color: 'var(--cn-text-secondary)' }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
