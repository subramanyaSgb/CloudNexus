'use client';

import { Search, Sun, Moon, Monitor, User, LogOut, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/auth';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useCallback } from 'react';

export function TopBar() {
  const { theme, toggle } = useTheme();
  const signOut = useAuthStore((s) => s.signOut);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isMobile = useIsMobile();

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  const handleSignOut = useCallback(async () => {
    setShowUserMenu(false);
    await signOut();
  }, [signOut]);

  return (
    <header
      className={`flex items-center justify-between border-b ${isMobile ? 'px-3' : 'px-4'}`}
      style={{
        height: 'var(--cn-topbar-height)',
        backgroundColor: 'var(--cn-bg-secondary)',
        borderColor: 'var(--cn-border)',
      }}
    >
      {/* Mobile: hamburger + page title */}
      {isMobile && (
        <div className="flex items-center gap-2">
          <button
            className="cn-interactive cn-focus-ring p-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--cn-text-secondary)' }}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold" style={{ color: 'var(--cn-text-primary)' }}>
            CloudNexus
          </span>
        </div>
      )}

      {/* Search — full bar on desktop, icon button on mobile */}
      {isMobile ? (
        <button
          className="cn-interactive cn-focus-ring p-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ color: 'var(--cn-text-secondary)' }}
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      ) : (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md flex-1 max-w-md"
          style={{
            backgroundColor: 'var(--cn-bg-tertiary)',
            border: '1px solid var(--cn-border)',
          }}
        >
          <Search size={16} style={{ color: 'var(--cn-text-secondary)' }} />
          <input
            type="text"
            placeholder="Search files, photos, music... (Ctrl+K)"
            className="bg-transparent border-none outline-none text-sm flex-1"
            style={{
              color: 'var(--cn-text-primary)',
            }}
          />
          <kbd
            className="hidden sm:inline-block text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--cn-bg-secondary)',
              color: 'var(--cn-text-secondary)',
              border: '1px solid var(--cn-border)',
            }}
          >
            /
          </kbd>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 ml-4">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="cn-interactive cn-focus-ring p-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ color: 'var(--cn-text-secondary)' }}
          aria-label={`Theme: ${theme}`}
          title={`Theme: ${theme}`}
        >
          <ThemeIcon size={18} />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="cn-interactive cn-focus-ring p-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--cn-text-secondary)' }}
            aria-label="User menu"
          >
            <User size={18} />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 z-50 py-1 rounded-lg min-w-[160px]"
                style={{
                  backgroundColor: 'var(--cn-bg-tertiary)',
                  border: '1px solid var(--cn-border)',
                  boxShadow: 'var(--cn-shadow-lg)',
                }}
              >
                <button
                  onClick={handleSignOut}
                  className="cn-interactive cn-focus-ring flex items-center gap-2 w-full px-3 py-2 text-sm"
                  style={{ color: 'var(--cn-danger)' }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
