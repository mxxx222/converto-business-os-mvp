import { unstable_cache } from 'next/cache';

/**
 * Cache insights for 1 hour
 */
export async function getCachedInsights(userId: string) {
  return unstable_cache(
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/finance-agent/insights`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
    [`insights-${userId}`],
    { revalidate: 3600, tags: ['insights'] }
  )();
}

/**
 * Cache reports for 30 minutes
 */
export async function getCachedReports(userId: string, period: string) {
  return unstable_cache(
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/reports/generate?period=${period}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
    [`reports-${userId}-${period}`],
    { revalidate: 1800, tags: ['reports'] }
  )();
}

/**
 * Cache receipts for 5 minutes
 */
export async function getCachedReceipts(userId: string, skip: number = 0, limit: number = 50) {
  return unstable_cache(
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/receipts?skip=${skip}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch receipts');
      return response.json();
    },
    [`receipts-${userId}-${skip}-${limit}`],
    { revalidate: 300, tags: ['receipts'] }
  )();
}
