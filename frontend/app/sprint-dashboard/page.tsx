'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  AlertCircle,
  CheckCircle2,
  Clock,
  Code2,
  GitBranch,
  Package,
  Zap,
  Database,
  Shield,
  DollarSign,
  Users,
  FileCode,
  Server,
  Layout,
  Sparkles,
} from 'lucide-react';

// SPRINT STRUKTUURI - DOMINO-LOGIIKALLA
const SPRINTS = [
  {
    id: 'sprint-0',
    name: '🔴 Sprint 0: KRIITTINEN - Deployment Fix',
    status: 'critical',
    priority: 0,
    startDate: '2024-11-04',
    endDate: '2024-11-05',
    description: 'Render.com deployment korjaukset - ESTO KAIKELLE MUULLE',
    blockers: [],
    tasks: [
      {
        id: 'task-0-1',
        title: 'Express Server Setup',
        file: 'frontend/server.js',
        status: 'done',
        priority: 'critical',
        estimatedHours: 1,
        code: `// frontend/server.js
const express = require('express');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = express();
    server.get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'converto-frontend'
      });
    });
    server.all('*', (req, res) => {
      return handle(req, res);
    });
    server.listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(\`> Ready on http://\${hostname}:\${port}\`);
    });
  })
  .catch((err) => {
    console.error('Error starting Next.js:', err);
    process.exit(1);
  });`,
      },
      {
        id: 'task-0-2',
        title: 'Package.json Scripts Update',
        file: 'frontend/package.json',
        status: 'done',
        priority: 'critical',
        estimatedHours: 0.5,
        code: `{
  "scripts": {
    "start": "node server.js",
    "build": "next build"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`,
      },
      {
        id: 'task-0-3',
        title: 'Health Check Route',
        file: 'frontend/app/api/health/route.ts',
        status: 'done',
        priority: 'critical',
        estimatedHours: 0.5,
        code: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'converto-frontend',
    environment: process.env.NODE_ENV
  });
}`,
      },
    ],
  },
  {
    id: 'sprint-1',
    name: '🟡 Sprint 1: Error Tracking & Monitoring',
    status: 'ready',
    priority: 1,
    startDate: '2024-11-05',
    endDate: '2024-11-06',
    description: 'Sentry integraatio virheenseurantaan',
    blockers: ['sprint-0'],
    tasks: [
      {
        id: 'task-1-1',
        title: 'Sentry Edge Config',
        file: 'frontend/sentry.edge.config.ts',
        status: 'done',
        priority: 'high',
        estimatedHours: 1,
        code: `import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});`,
      },
      {
        id: 'task-1-2',
        title: 'Sentry Properties',
        file: 'frontend/sentry.properties',
        status: 'done',
        priority: 'high',
        estimatedHours: 0.5,
        code: `defaults.url=https://sentry.io/
defaults.org=converto
defaults.project=converto-frontend
auth.token=\${SENTRY_AUTH_TOKEN}
cli.executable=node_modules/@sentry/cli/bin/sentry-cli`,
      },
      {
        id: 'task-1-3',
        title: 'Sentry Test Page',
        file: 'frontend/app/sentry-example-page/page.tsx',
        status: 'done',
        priority: 'medium',
        estimatedHours: 1.5,
        code: `// Full Sentry test page code here...`,
      },
    ],
  },
  {
    id: 'sprint-2',
    name: '🟢 Sprint 2: Quick Wins Marketing',
    status: 'ready',
    priority: 2,
    startDate: '2024-11-06',
    endDate: '2024-11-08',
    description: 'Marketing komponentit konversion parantamiseen',
    blockers: ['sprint-0'],
    tasks: [
      {
        id: 'task-2-1',
        title: 'Logos Bar Component',
        file: 'frontend/components/marketing/LogosBar.tsx',
        status: 'done',
        priority: 'medium',
        estimatedHours: 2,
        code: `// LogosBar component code...`,
      },
      {
        id: 'task-2-2',
        title: 'Testimonials Component',
        file: 'frontend/components/marketing/Testimonials.tsx',
        status: 'done',
        priority: 'medium',
        estimatedHours: 2,
        code: `// Testimonials component code...`,
      },
      {
        id: 'task-2-3',
        title: 'Trust Badges',
        file: 'frontend/components/marketing/TrustBadges.tsx',
        status: 'done',
        priority: 'low',
        estimatedHours: 1,
        code: `// TrustBadges component code...`,
      },
      {
        id: 'task-2-4',
        title: 'Skeleton Component',
        file: 'frontend/components/ui/Skeleton.tsx',
        status: 'done',
        priority: 'medium',
        estimatedHours: 1,
        code: `// Skeleton component code...`,
      },
    ],
  },
  {
    id: 'sprint-3',
    name: '💰 Sprint 3: Revenue Generation',
    status: 'ready',
    priority: 3,
    startDate: '2024-11-08',
    endDate: '2024-11-11',
    description: 'Registration flow ja payment processing',
    blockers: ['sprint-0', 'sprint-2'],
    tasks: [
      {
        id: 'task-3-1',
        title: 'Registration Page',
        file: 'frontend/app/register/page.tsx',
        status: 'done',
        priority: 'critical',
        estimatedHours: 4,
        code: `// Full registration page code...`,
      },
      {
        id: 'task-3-2',
        title: 'Mock Payment API',
        file: 'frontend/app/api/mockPayment/route.ts',
        status: 'done',
        priority: 'high',
        estimatedHours: 2,
        code: `// Mock payment API code...`,
      },
      {
        id: 'task-3-3',
        title: 'QR Landing Page',
        file: 'frontend/app/qr/page.tsx',
        status: 'done',
        priority: 'medium',
        estimatedHours: 2,
        code: `// QR page code...`,
      },
    ],
  },
  {
    id: 'sprint-4',
    name: '🤖 Sprint 4: AI & OCR Features',
    status: 'planned',
    priority: 4,
    startDate: '2024-11-11',
    endDate: '2024-11-13',
    description: 'OCR processing ja AI kategorisointi',
    blockers: ['sprint-3'],
    tasks: [
      {
        id: 'task-4-1',
        title: 'OCR Processing API',
        file: 'frontend/app/api/ocr/process/route.ts',
        status: 'done',
        priority: 'high',
        estimatedHours: 3,
        code: `// OCR API code...`,
      },
      {
        id: 'task-4-2',
        title: 'Email Inbox Processor',
        file: 'backend/modules/email/processor.py',
        status: 'done',
        priority: 'high',
        estimatedHours: 4,
        code: `# Email processor code...`,
      },
    ],
  },
  {
    id: 'sprint-5',
    name: '📈 Sprint 5: Activation & Retention',
    status: 'planned',
    priority: 5,
    startDate: '2024-11-13',
    endDate: '2024-11-15',
    description: 'User activation ja churn prevention',
    blockers: ['sprint-3'],
    tasks: [
      {
        id: 'task-5-1',
        title: 'Onboarding Checklist',
        file: 'frontend/components/onboarding/Checklist.tsx',
        status: 'done',
        priority: 'high',
        estimatedHours: 3,
        code: `// Onboarding checklist code...`,
      },
      {
        id: 'task-5-2',
        title: 'Referral System',
        file: 'frontend/components/marketing/ReferralBanner.tsx',
        status: 'done',
        priority: 'medium',
        estimatedHours: 2,
        code: `// Referral banner code...`,
      },
      {
        id: 'task-5-3',
        title: 'Exit Intent Modal',
        file: 'frontend/components/modals/ExitIntentModal.tsx',
        status: 'done',
        priority: 'medium',
        estimatedHours: 2,
        code: `// Exit intent modal code...`,
      },
      {
        id: 'task-5-4',
        title: 'Churn Deflect Modal',
        file: 'frontend/components/billing/ChurnDeflectModal.tsx',
        status: 'done',
        priority: 'high',
        estimatedHours: 3,
        code: `// Churn deflect modal code...`,
      },
      {
        id: 'task-5-5',
        title: 'Annual Billing Toggle',
        file: 'frontend/components/billing/AnnualBillingToggle.tsx',
        status: 'done',
        priority: 'low',
        estimatedHours: 1,
        code: `// Annual billing toggle code...`,
      },
    ],
  },
  {
    id: 'sprint-6',
    name: '📊 Sprint 6: Analytics & Tracking',
    status: 'planned',
    priority: 6,
    startDate: '2024-11-15',
    endDate: '2024-11-16',
    description: 'Event tracking ja analytics',
    blockers: ['sprint-5'],
    tasks: [
      {
        id: 'task-6-1',
        title: 'Event Tracking API',
        file: 'frontend/app/api/event/route.ts',
        status: 'done',
        priority: 'medium',
        estimatedHours: 2,
        code: `// Event tracking API code...`,
      },
      {
        id: 'task-6-2',
        title: 'Event Stats API',
        file: 'frontend/app/api/event/stats/route.ts',
        status: 'done',
        priority: 'low',
        estimatedHours: 1,
        code: `// Event stats API code...`,
      },
      {
        id: 'task-6-3',
        title: 'Search Stats Backend',
        file: 'backend/modules/search/stats.py',
        status: 'done',
        priority: 'low',
        estimatedHours: 2,
        code: `# Search stats backend code...`,
      },
      {
        id: 'task-6-4',
        title: 'Dashboard KPI Updates',
        file: 'frontend/app/dashboard/page.tsx',
        status: 'done',
        priority: 'medium',
        estimatedHours: 2,
        code: `// Dashboard KPI updates code...`,
      },
    ],
  },
];

// MAIN COMPONENT
export default function SprintDashboard() {
  const [selectedSprint, setSelectedSprint] = useState(SPRINTS[0]);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({});

  // Calculate sprint progress
  const calculateSprintProgress = (sprint: typeof SPRINTS[0]) => {
    const tasks = sprint.tasks;
    const completed = tasks.filter(
      (t) => taskStatuses[t.id] === 'done' || t.status === 'done'
    ).length;
    return (completed / tasks.length) * 100;
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    SPRINTS.forEach((sprint) => {
      totalTasks += sprint.tasks.length;
      sprint.tasks.forEach((task) => {
        if (taskStatuses[task.id] === 'done' || task.status === 'done') {
          completedTasks++;
        }
      });
    });
    return (completedTasks / totalTasks) * 100;
  };

  // Copy code to clipboard
  const copyToClipboard = async (code: string, taskId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setTimeout(() => {
        // Reset after 2 seconds
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Update task status
  const updateTaskStatus = (taskId: string, status: string) => {
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: status,
    }));
  };

  // Get sprint status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'ready':
        return 'text-yellow-600 bg-yellow-50';
      case 'planned':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get task priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🚀 Converto Business OS - Sprint Dashboard
          </h1>
          <p className="text-gray-600">
            Kaikki puuttuvat koodit domino-logiikalla järjestettyinä sprintteinä
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kokonaistilanne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Overall Progress</span>
                  <span className="font-bold">
                    {Math.round(calculateOverallProgress())}%
                  </span>
                </div>
                <Progress value={calculateOverallProgress()} className="h-3" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {SPRINTS.filter((s) => s.status === 'critical').length}
                  </p>
                  <p className="text-sm text-gray-600">Kriittisiä</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {SPRINTS.filter((s) => s.status === 'ready').length}
                  </p>
                  <p className="text-sm text-gray-600">Valmiita</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {SPRINTS.filter((s) => s.status === 'planned').length}
                  </p>
                  <p className="text-sm text-gray-600">Suunniteltuja</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {SPRINTS.filter((s) => s.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Valmiita</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          {/* Sprint List */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Sprintit (Domino-järjestys)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {SPRINTS.map((sprint) => (
                    <div
                      key={sprint.id}
                      onClick={() => setSelectedSprint(sprint)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedSprint.id === sprint.id
                          ? 'ring-2 ring-blue-500 shadow-lg'
                          : 'hover:shadow-md'
                      } ${getStatusColor(sprint.status)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{sprint.name}</h3>
                          <p className="text-xs mt-1 opacity-75">
                            {sprint.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {sprint.tasks.length} tehtävää
                            </Badge>
                            {sprint.blockers.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                Estetty
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress
                          value={calculateSprintProgress(sprint)}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sprint Details */}
          <div className="col-span-8">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedSprint.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedSprint.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(selectedSprint.status)}>
                      {selectedSprint.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedSprint.startDate} - {selectedSprint.endDate}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Blockers Warning */}
                {selectedSprint.blockers.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        Estetty sprinteillä: {selectedSprint.blockers.join(', ')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tasks */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Tehtävät</h3>
                  {selectedSprint.tasks.map((task) => {
                    const status = taskStatuses[task.id] || task.status;
                    return (
                      <div
                        key={task.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{task.title}</h4>
                              <Badge
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">📁 {task.file}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              ⏱️ {task.estimatedHours} tuntia
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={status}
                              onChange={(e) =>
                                updateTaskStatus(task.id, e.target.value)
                              }
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="todo">📝 Todo</option>
                              <option value="in_progress">🔄 In Progress</option>
                              <option value="review">👀 Review</option>
                              <option value="done">✅ Done</option>
                            </select>
                          </div>
                        </div>

                        {/* Code Block */}
                        {task.code && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Koodi:</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(task.code, task.id)}
                              >
                                <FileCode className="w-4 h-4 mr-1" />
                                Kopioi
                              </Button>
                            </div>
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs">
                              <code>{task.code.substring(0, 200)}...</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
