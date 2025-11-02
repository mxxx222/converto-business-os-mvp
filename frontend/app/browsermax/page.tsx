"use client";

import { useState, useEffect } from 'react';

interface TestRun {
  id: string;
  url: string;
  test_type: string;
  status: string;
  browser_type: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  results?: any;
  error_message?: string;
}

interface DashboardStats {
  total_tests: number;
  successful_tests: number;
  failed_tests: number;
  avg_load_time: number;
  active_monitors: number;
  uptime_percentage: number;
}

export default function BrowserMaxDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_tests: 0,
    successful_tests: 0,
    failed_tests: 0,
    avg_load_time: 0,
    active_monitors: 0,
    uptime_percentage: 0
  });
  const [newTest, setNewTest] = useState({
    url: '',
    test_type: 'qa',
    browser_type: 'firefox'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testTypeLabels: Record<string, string> = {
    qa: 'QA Testing',
    monitoring: 'Performance Monitoring',
    rpa: 'Form Automation',
    cross_browser: 'Cross-Browser Testing'
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  const runTest = async () => {
    if (!apiKey || !newTest.url) {
      setError('API Key and URL are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/tests/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(newTest)
      });

      if (response.ok) {
        const result = await response.json();
        setTestRuns(prev => [result, ...prev]);
        setNewTest({ url: '', test_type: 'qa', browser_type: 'firefox' });
      } else {
        setError('Failed to start test');
      }
    } catch (err) {
      setError('Connection error. Make sure API is running.');
    }

    setLoading(false);
  };

  const fetchTestRuns = async () => {
    if (!apiKey) return;

    try {
      const response = await fetch('http://localhost:8000/api/v1/tests', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.ok) {
        const runs = await response.json();
        setTestRuns(runs);

        // Calculate stats
        const total = runs.length;
        const successful = runs.filter((run: TestRun) => run.status === 'completed').length;
        const failed = runs.filter((run: TestRun) => run.status === 'failed').length;
        const avgLoadTime = runs
          .filter((run: TestRun) => run.results?.performance?.timing?.total_load_time)
          .reduce((sum: number, run: TestRun) => sum + run.results.performance.timing.total_load_time, 0) / total || 0;

        setStats({
          total_tests: total,
          successful_tests: successful,
          failed_tests: failed,
          avg_load_time: Math.round(avgLoadTime),
          active_monitors: 5,
          uptime_percentage: 99.5
        });
      }
    } catch (err) {
      console.error('Failed to fetch test runs:', err);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchTestRuns();
      const interval = setInterval(fetchTestRuns, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [apiKey]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">BrowserMax Dashboard</h1>
            <p className="text-gray-600">All-in-one browser automation platform</p>
          </div>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Professional Plan
          </span>
        </div>

        {/* API Key Setup */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
          <p className="text-gray-600 mb-4">Enter your API key to access the platform</p>
          <div className="flex space-x-4">
            <input
              type="password"
              placeholder="bm_tenantid_random"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchTestRuns}
              disabled={!apiKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Connect
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Total Tests</h3>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.total_tests}</p>
              <p className="text-sm text-gray-500">
                +{Math.round(stats.successful_tests / Math.max(stats.total_tests, 1) * 100)}% success rate
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Avg Load Time</h3>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.avg_load_time}ms</p>
              <p className="text-sm text-gray-500">
                {stats.avg_load_time < 2000 ? '🟢' : '🟡'} Performance status
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Active Monitors</h3>
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.active_monitors}</p>
              <p className="text-sm text-gray-500">
                {stats.uptime_percentage}% uptime
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Failed Tests</h3>
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-red-600">{stats.failed_tests}</p>
              <p className="text-sm text-gray-500">
                {stats.failed_tests > 0 ? '⚠️ Needs attention' : '🎉 All green'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* New Test Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Run New Test</h2>
            <p className="text-gray-600 mb-4">Start a new browser automation test</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newTest.url}
                  onChange={(e) => setNewTest(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select
                  value={newTest.test_type}
                  onChange={(e) => setNewTest(prev => ({ ...prev, test_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(testTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Browser</label>
                <select
                  value={newTest.browser_type}
                  onChange={(e) => setNewTest(prev => ({ ...prev, browser_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="firefox">Firefox</option>
                  <option value="webkit">Safari/WebKit</option>
                  <option value="chromium">Chrome</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={runTest}
                disabled={loading || !apiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Running...' : 'Run Test'}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Test Runs List */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Recent Test Runs</h2>
            <p className="text-gray-600 mb-4">Your latest browser automation tests</p>
            <div className="space-y-4">
              {testRuns.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No test runs yet. Create your first test above.</p>
              ) : (
                testRuns.slice(0, 10).map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{run.url}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[run.status] || 'bg-gray-100 text-gray-800'}`}>
                          {run.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {testTypeLabels[run.test_type] || run.test_type}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {run.browser_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(run.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {run.results?.performance?.timing?.total_load_time && (
                        <p className="text-sm font-medium">
                          {run.results.performance.timing.total_load_time}ms
                        </p>
                      )}
                      {run.error_message && (
                        <p className="text-sm text-red-600">{run.error_message}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
