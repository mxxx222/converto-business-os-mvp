'use client';

import Link from 'next/link';
import { Home, Brain, Receipt, BarChart3, Settings, ChevronLeft, Gift } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  currentPath: string;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/app/dashboard' },
  { icon: Brain, label: 'Insights', path: '/app/dashboard/insights' },
  { icon: Receipt, label: 'Kuitit', path: '/app/dashboard/receipts' },
  { icon: BarChart3, label: 'Raportit', path: '/app/dashboard/reports' },
  { icon: Gift, label: 'Referral', path: '/app/dashboard/referral' },
  { icon: Settings, label: 'Asetukset', path: '/app/dashboard/settings' },
];

export function Sidebar({ currentPath, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Converto</h2>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
