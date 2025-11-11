'use client'

import { useState, useEffect } from 'react'

interface Customer {
  id: string
  name: string
  email: string
  company: string
  status: 'active' | 'trial' | 'churned' | 'suspended'
  plan: 'starter' | 'professional' | 'enterprise'
  joinDate: string
  lastActivity: string
  documentsProcessed: number
  monthlyFee: number
  contactPerson?: string
  phone?: string
  address?: string
  notes?: string
}

const mockCustomers: Customer[] = [
  {
    id: 'cust_001',
    name: 'Acme Corporation',
    email: 'admin@acme.com',
    company: 'Acme Corporation',
    status: 'active',
    plan: 'enterprise',
    joinDate: '2024-03-15T08:00:00Z',
    lastActivity: '2025-11-11T09:30:00Z',
    documentsProcessed: 1247,
    monthlyFee: 299,
    contactPerson: 'John Smith',
    phone: '+358 50 123 4567',
    address: 'Mannerheimintie 123, 00100 Helsinki',
    notes: 'Large enterprise client with complex document workflows'
  },
  {
    id: 'cust_002',
    name: 'Tech Solutions Oy',
    email: 'info@techsolutions.fi',
    company: 'Tech Solutions Oy',
    status: 'active',
    plan: 'professional',
    joinDate: '2024-08-22T10:15:00Z',
    lastActivity: '2025-11-10T15:45:00Z',
    documentsProcessed: 423,
    monthlyFee: 99,
    contactPerson: 'Maria Virtanen',
    phone: '+358 40 987 6543',
    address: 'Keskusta 45, 20100 Turku',
    notes: 'Growing business, potential for upgrade'
  },
  {
    id: 'cust_003',
    name: 'Globex Corporation',
    email: 'billing@globex.com',
    company: 'Globex Corporation',
    status: 'trial',
    plan: 'starter',
    joinDate: '2025-10-30T14:20:00Z',
    lastActivity: '2025-11-08T11:00:00Z',
    documentsProcessed: 12,
    monthlyFee: 29,
    contactPerson: 'Peter Johnson',
    phone: '+358 45 555 1234',
    address: 'Yrjönkatu 8, 00120 Helsinki',
    notes: 'In trial period, monitoring usage closely'
  },
  {
    id: 'cust_004',
    name: 'Initech',
    email: 'support@initech.com',
    company: 'Initech',
    status: 'churned',
    plan: 'professional',
    joinDate: '2024-01-10T12:00:00Z',
    lastActivity: '2025-09-15T16:30:00Z',
    documentsProcessed: 890,
    monthlyFee: 99,
    contactPerson: 'Bill Lumbergh',
    notes: 'Churned due to budget cuts, may return in Q1 2026'
  }
]

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [filterStatus, setFilterStatus] = useState<Customer['status'] | 'all'>('all')
  const [filterPlan, setFilterPlan] = useState<Customer['plan'] | 'all'>('all')
  const [showContactModal, setShowContactModal] = useState(false)

  const filteredCustomers = customers
    .filter(customer => filterStatus === 'all' || customer.status === filterStatus)
    .filter(customer => filterPlan === 'all' || customer.plan === filterPlan)
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())

  const handleContactCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowContactModal(true)
  }

  const getStatusBadge = (status: Customer['status']) => {
    const styles = {
      active: 'badge-success',
      trial: 'badge-warning',
      churned: 'badge-destructive',
      suspended: 'badge-secondary'
    }
    return <span className={`badge ${styles[status]}`}>{status}</span>
  }

  const getPlanBadge = (plan: Customer['plan']) => {
    const styles = {
      starter: 'bg-gray-100 text-gray-800',
      professional: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[plan]}`}>
        {plan}
      </span>
    )
  }

  const getStatusColor = (status: Customer['status']) => {
    const colors = {
      active: 'text-green-600',
      trial: 'text-yellow-600',
      churned: 'text-red-600',
      suspended: 'text-gray-600'
    }
    return colors[status]
  }

  const totalMRR = customers
    .filter(c => c.status === 'active')
    .reduce((sum, customer) => sum + customer.monthlyFee, 0)

  const totalDocuments = customers.reduce((sum, customer) => sum + customer.documentsProcessed, 0)

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-medium">Customer Management</h3>
          <p className="text-sm text-gray-500">
            {filteredCustomers.length} customers • MRR: €{totalMRR}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Customer['status'] | 'all')}
            className="input text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="churned">Churned</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value as Customer['plan'] | 'all')}
            className="input text-sm"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{customer.company}</h4>
                <p className="text-sm text-gray-600">{customer.name}</p>
              </div>
              <div className="flex flex-col items-end space-y-1">
                {getStatusBadge(customer.status)}
                {getPlanBadge(customer.plan)}
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div>📧 {customer.email}</div>
              {customer.contactPerson && <div>👤 {customer.contactPerson}</div>}
              {customer.phone && <div>📞 {customer.phone}</div>}
              <div>📄 {customer.documentsProcessed} documents</div>
              <div className="flex items-center space-x-2">
                <span>💰 €{customer.monthlyFee}/month</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
              <span>Joined: {new Date(customer.joinDate).toLocaleDateString('fi-FI')}</span>
              <span className={getStatusColor(customer.status)}>
                {customer.status === 'active' ? '🟢' : 
                 customer.status === 'trial' ? '🟡' : 
                 customer.status === 'churned' ? '🔴' : '⚫'} {customer.status}
              </span>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => handleContactCustomer(customer)}
                className="flex-1 btn btn-outline text-xs"
              >
                Contact
              </button>
              <button className="flex-1 btn btn-secondary text-xs">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="metric-value text-green-600">{customers.filter(c => c.status === 'active').length}</div>
          <div className="metric-label">Active Customers</div>
        </div>
        <div className="metric-card">
          <div className="metric-value text-yellow-600">{customers.filter(c => c.status === 'trial').length}</div>
          <div className="metric-label">In Trial</div>
        </div>
        <div className="metric-card">
          <div className="metric-value text-red-600">{customers.filter(c => c.status === 'churned').length}</div>
          <div className="metric-label">Churned</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalDocuments.toLocaleString()}</div>
          <div className="metric-label">Total Documents</div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Contact Customer</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Customer</label>
                <div className="text-sm text-gray-600">{selectedCustomer.company}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Contact Person</label>
                <div className="text-sm text-gray-600">{selectedCustomer.name} ({selectedCustomer.contactPerson})</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="text-sm text-blue-600">{selectedCustomer.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <div className="text-sm text-gray-600">{selectedCustomer.phone || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Current Plan</label>
                <div className="text-sm text-gray-600">{selectedCustomer.plan} - €{selectedCustomer.monthlyFee}/month</div>
              </div>
              
              {selectedCustomer.notes && (
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <div className="text-sm text-gray-600">{selectedCustomer.notes}</div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => {
                  window.open(`mailto:${selectedCustomer.email}?subject=DocFlow%20Support&body=Hello%20${selectedCustomer.name},%0A%0A`)
                  setShowContactModal(false)
                }}
                className="flex-1 btn btn-primary text-sm"
              >
                Send Email
              </button>
              {selectedCustomer.phone && (
                <button
                  onClick={() => {
                    window.open(`tel:${selectedCustomer.phone}`)
                    setShowContactModal(false)
                  }}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  Call
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}