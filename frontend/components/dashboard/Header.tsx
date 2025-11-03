'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, Moon, Sun, Settings, LogOut, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  onCommandOpen: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

export function Header({ onCommandOpen, darkMode, onDarkModeToggle }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get user email
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/app/login');
  };
  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button
          onClick={onCommandOpen}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-1 text-left text-sm text-gray-500 dark:text-gray-400"
        >
          <Search className="w-4 h-4" />
          <span>Hae tai suorita komento...</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onDarkModeToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Profile"
          >
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userEmail?.split('@')[0] || 'Käyttäjä'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userEmail || ''}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <a
                  href="/app/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Asetukset</span>
                </a>
                <a
                  href="/app/dashboard/settings?tab=team"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Tiimi</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Kirjaudu ulos</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
