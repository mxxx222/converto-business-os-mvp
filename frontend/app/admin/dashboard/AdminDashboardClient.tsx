/** @fileoverview Client wrapper for admin dashboard with module switching */

'use client';

import { useState } from 'react';
import ActivityFeed from './ActivityFeed';
import QueueManager from './segments/QueueManager';
import OcrTriage from './segments/OcrTriage';
import Customers from './segments/Customers';
import Analytics from './segments/Analytics';
import Billing from './segments/Billing';
import ApiMonitoring from './segments/ApiMonitoring';
import { AdminSegmentErrorBoundary } from '@/components/admin/ui/ErrorBoundary';
import styles from './styles.module.css';

interface AdminDashboardClientProps {
  adminToken: string;
  tenantId: string;
  apiUrl?: string;
  wsUrl?: string;
}

export default function AdminDashboardClient({ 
  adminToken, 
  tenantId,
  apiUrl = 'http://localhost:8000',
  wsUrl = 'ws://localhost:8000'
}: AdminDashboardClientProps) {
  const [activeModule, setActiveModule] = useState('activity');

  const modules = [
    {
      id: 'activity',
      title: 'Activity Feed',
      icon: '📊',
      description: 'Real-time system activity monitoring',
      component: ActivityFeed,
      props: {
        apiUrl,
        wsUrl,
        adminToken
      }
    },
    {
      id: 'queue',
      title: 'Queue Manager',
      icon: '📋',
      description: 'Document processing queue management',
      component: QueueManager,
      props: {
        adminToken,
        tenantId
      }
    },
    {
      id: 'ocr',
      title: 'OCR Triage',
      icon: '🔍',
      description: 'OCR error monitoring and resolution',
      component: OcrTriage,
      props: {
        adminToken,
        tenantId
      }
    },
    {
      id: 'customers',
      title: 'Customers',
      icon: '👥',
      description: 'Customer relationship management',
      component: Customers,
      props: {}
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: '📈',
      description: 'System performance and business metrics',
      component: Analytics,
      props: {}
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: '💰',
      description: 'Subscription and invoice management',
      component: Billing,
      props: {}
    },
    {
      id: 'monitoring',
      title: 'API Monitoring',
      icon: '🔧',
      description: 'API health and performance monitoring',
      component: ApiMonitoring,
      props: {}
    }
  ];

  const activeModuleData = modules.find(m => m.id === activeModule);
  const ActiveComponent = activeModuleData?.component;

  return (
    <main className={styles.dashboardPage}>
      <div className={styles.container}>
        {/* Page Header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>DocFlow Admin Control Plane</h1>
            <p className={styles.pageDescription}>
              Comprehensive real-time monitoring and management dashboard
            </p>
            {adminToken && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">🟢 Authenticated</span>
                <span className="text-xs text-gray-500">Token: {adminToken.slice(-8)}</span>
              </div>
            )}
          </div>
        </header>

        {/* Module Navigation */}
        <nav className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeModule === module.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  title={module.description}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{module.icon}</span>
                    <span className="text-xs">{module.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </nav>

        {/* Active Module Content */}
        {ActiveComponent && (
          <section className={styles.feedSection}>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <span>{activeModuleData?.icon}</span>
                    <span>{activeModuleData?.title}</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeModuleData?.description}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleString('fi-FI')}
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
                  >
                    🔄 Refresh All
                  </button>
                </div>
              </div>
            </div>

            <AdminSegmentErrorBoundary segmentName={activeModuleData?.title || 'Unknown Segment'}>
              <ActiveComponent {...(activeModuleData.props as any)} />
            </AdminSegmentErrorBoundary>
          </section>
        )}

        {/* Footer */}
        <footer className={styles.pageFooter}>
          <div className="flex items-center justify-between">
            <p className={styles.footerText}>
              DocFlow Admin Control Plane • Real-time bus connected
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>🔄 Auto-refresh: 30s</span>
              <span>🟢 WebSocket: Connected</span>
              <span>📊 Status: Operational</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

