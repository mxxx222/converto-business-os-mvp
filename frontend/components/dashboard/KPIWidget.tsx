'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPIWidgetProps {
  title: string;
  value: string | number | React.ReactNode;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}

export function KPIWidget({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  loading = false,
}: KPIWidgetProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  };

  const iconColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border ${colorClasses[color]} p- `.concat(
        '6 hover:shadow-lg transition-all duration-200'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        </div>
        {icon && <div className={iconColors[color]}>{icon}</div>}
      </div>
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 text-sm">
          {change > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : change < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          ) : (
            <Minus className="w-4 h-4 text-gray-400" />
          )}
          <span
            className={
              change > 0
                ? 'text-green-600 dark:text-green-400'
                : change < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }
          >
            {change > 0 ? '+' : ''}
            {change?.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-gray-500 dark:text-gray-400 ml-1">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

