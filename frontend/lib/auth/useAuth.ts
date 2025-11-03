'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from './rbac';

interface TeamContext {
  teamId: string | null;
  teamName: string | null;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  team: TeamContext | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for authentication and team context
 * Fetches user, team membership, and role from Supabase
 */
export function useAuth(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<TeamContext | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchAuthData() {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        setUser(currentUser);

        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Fetch team membership and role
        // First, get user's team memberships
        const { data: memberships, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id, role, teams(id, name)')
          .eq('user_id', currentUser.id)
          .limit(1)
          .single();

        if (membershipError && membershipError.code !== 'PGRST116') {
          // PGRST116 = no rows returned (expected if no team)
          console.warn('Error fetching team membership:', membershipError);
        }

        if (memberships) {
          const teamData = memberships.teams as any;
          setTeam({
            teamId: memberships.team_id,
            teamName: teamData?.name || null,
            role: (memberships.role as UserRole) || 'viewer',
          });
          setRole((memberships.role as UserRole) || 'viewer');
        } else {
          // No team membership - default to viewer
          setTeam(null);
          setRole('viewer');
        }
      } catch (err: any) {
        console.error('Error in useAuth:', err);
        setError(err.message || 'Authentication error');
        setUser(null);
        setTeam(null);
        setRole('viewer');
      } finally {
        setLoading(false);
      }
    }

    fetchAuthData();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Re-fetch team data when auth changes
        fetchAuthData();
      } else {
        setUser(null);
        setTeam(null);
        setRole('viewer');
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    team,
    role,
    loading,
    error,
  };
}
