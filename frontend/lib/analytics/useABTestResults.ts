'use client';

import { useState, useEffect } from 'react';

interface ABTestResult {
  variant: string;
  views: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
}

interface ABTestResultsData {
  testName: string;
  totalViews: number;
  totalConversions: number;
  overallConversionRate: number;
  variants: ABTestResult[];
  startDate: string;
  endDate?: string;
}

export function useABTestResults(testName: string = 'storybrand_vs_original') {
  const [results, setResults] = useState<ABTestResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/ab-test-results?test=${testName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch A/B test results');
        }
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();

    // Refresh every 5 minutes
    const interval = setInterval(fetchResults, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [testName]);

  return { results, loading, error };
}
