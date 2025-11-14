import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminActivityFeed from '@/components/dashboard/AdminActivityFeed';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  }),
}));

describe('AdminActivityFeed', () => {
  it('renders empty state when no events', () => {
    render(<AdminActivityFeed />);
    expect(screen.getByText(/Ei aktiviteetteja vielä/i)).toBeDefined();
  });
});


