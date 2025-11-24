'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UserMenu() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        // Still redirect even if there's an error
      }
      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect on error
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-3 relative">
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-700">Käyttäjä</span>
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-sm font-medium text-white">K</span>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="ml-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Kirjaudutaan...' : 'Kirjaudu ulos'}
        </button>
      </div>
    </div>
  );
}

