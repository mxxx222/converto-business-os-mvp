'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Package, FileText, Building } from 'lucide-react';

const activities = [
  {
    icon: FileText,
    text: 'Rakennusyritys käsitteli 45 laskua',
    time: 2,
    color: 'blue'
  },
  {
    icon: Package,
    text: 'Kuljetusyritys latasi 12 rahtikirjaa',
    time: 5,
    color: 'orange'
  },
  {
    icon: TrendingUp,
    text: 'IT-konsultti säästy €1,150/kk',
    time: 8,
    color: 'green'
  },
  {
    icon: Users,
    text: 'Tilitoimisto liittyi beta-ohjelmaan',
    time: 12,
    color: 'purple'
  },
  {
    icon: Building,
    text: 'Pk-yritys skannasi 23 kuittia',
    time: 15,
    color: 'pink'
  },
  {
    icon: FileText,
    text: 'Kauppaliike automatisoi ostolaskut',
    time: 18,
    color: 'indigo'
  }
];

export function LiveActivity() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show after 5 seconds on page
    const initialTimer = setTimeout(() => setShow(true), 5000);

    // Rotate every 8 seconds
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setShow(true);
      }, 300);
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  const activity = activities[currentIndex];
  const Icon = activity.icon;

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-700',
    orange: 'from-orange-500 to-orange-700',
    green: 'from-green-500 to-green-700',
    purple: 'from-purple-500 to-purple-700',
    pink: 'from-pink-500 to-pink-700',
    indigo: 'from-indigo-500 to-indigo-700'
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm animate-in slide-in-from-left duration-500">
      <div className="bg-white border-2 border-blue-200 rounded-xl shadow-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[activity.color]} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">{activity.text}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {activity.time} minuuttia sitten
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
