'use client';

import { MetricsDashboard } from '@/components/workflows/MetricsDashboard';

export default function WorkflowMetricsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Workflow Metrics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reaaliaikaiset workflow-metriikat ja suoritustilastot
          </p>
        </div>

        <MetricsDashboard />
      </div>
    </div>
  );
}
