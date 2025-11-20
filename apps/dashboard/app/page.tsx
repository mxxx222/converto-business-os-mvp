'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RealTimeActivity from '@/components/RealTimeActivity'
import DocumentQueueManager from '@/components/DocumentQueueManager'
import { DocumentsTable } from '@/components/dashboard/documents-table'
import OCRErrorTriage from '@/components/OCRErrorTriage'
import Customers from '@/components/Customers'
import CustomersPage from '@/app/customers/page'
import Analytics from '@/components/Analytics'
import Billing from '@/components/Billing'
import APIMonitoring from '@/components/APIMonitoring'
import type { AdminUser } from '@/lib/auth'
import { authManager, canAccessModule } from '@/lib/auth'

type DashboardModule = 
  | 'activity'
  | 'queue' 
  | 'ocr'
  | 'customers'
  | 'analytics'
  | 'billing'
  | 'api'

const moduleConfig = {
  activity: { 
    title: 'Real-time Activity Feed', 
    icon: '📊', 
    component: RealTimeActivity,
    description: 'Live feed of all system events and activities'
  },
  queue: { 
    title: 'Document Queue Manager', 
    icon: '📄', 
    component: DocumentsTable,
    description: 'Manage pending documents and bulk operations'
  },
  ocr: { 
    title: 'OCR Error Triage', 
    icon: '⚠️', 
    component: OCRErrorTriage,
    description: 'Review and fix OCR processing errors'
  },
  customers: { 
    title: 'Customers', 
    icon: '👥', 
    component: CustomersPage,
    description: 'Customer management and statistics'
  },
  analytics: { 
    title: 'Analytics & Reporting', 
    icon: '📈', 
    component: Analytics,
    description: 'KPI metrics, charts, and trends'
  },
  billing: { 
    title: 'Billing & Invoicing', 
    icon: '💰', 
    component: Billing,
    description: 'MRR tracking, churn analysis, and invoices'
  },
  api: { 
    title: 'API Monitoring', 
    icon: '🛠️', 
    component: APIMonitoring,
    description: 'Health checks, latency, and error monitoring'
  }
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [activeModule, setActiveModule] = useState<DashboardModule>('activity')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on component mount using Supabase
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authManager.isAuthenticated()
        if (!isAuthenticated) {
          router.push('/login')
          return
        }
        
        const adminUser = await authManager.getAdminUser()
        if (!adminUser) {
          router.push('/login')
          return
        }
        
        setUser(adminUser)
      } catch (error) {
        console.error('Failed to check authentication:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await authManager.logout()
    // authManager.logout() already redirects to /login
  }

  // Filter modules based on user permissions
  const accessibleModules = Object.entries(moduleConfig).filter(([key, config]) => 
    canAccessModule(user, key)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">📋</div>
          <div className="text-lg">Loading DocFlow Admin...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const ActiveComponent = moduleConfig[activeModule].component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📋</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DocFlow Admin</h1>
                <p className="text-sm text-gray-500">Internal Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="status-indicator status-online"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
              <div className="text-sm text-gray-600">
                Welcome, {user.name}
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-outline text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {accessibleModules.map(([key, config]) => {
                const isActive = activeModule === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveModule(key as DashboardModule)}
                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg mr-3">{config.icon}</span>
                    <span className="flex-1 text-left">{config.title}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {moduleConfig[activeModule].title}
              </h2>
              <p className="text-gray-600 mt-1">
                {moduleConfig[activeModule].description}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}