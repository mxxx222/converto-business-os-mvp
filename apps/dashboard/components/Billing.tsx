'use client'

import { useState, useEffect } from 'react'

interface Invoice {
  id: string
  customerId: string
  customerName: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  issueDate: string
  plan: 'starter' | 'professional' | 'enterprise'
  period: string
  description: string
  paymentMethod?: string
  paidDate?: string
}

interface PaymentTransaction {
  id: string
  customerId: string
  customerName: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  date: string
  method: 'card' | 'bank_transfer' | 'paypal' | 'invoice'
  reference: string
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    customerId: 'cust_001',
    customerName: 'Acme Corporation',
    amount: 299,
    status: 'paid',
    dueDate: '2025-12-15',
    issueDate: '2025-11-15',
    plan: 'enterprise',
    period: 'December 2025',
    description: 'DocFlow Enterprise Plan - Monthly subscription',
    paymentMethod: 'Credit Card',
    paidDate: '2025-11-15'
  },
  {
    id: 'inv_002',
    customerId: 'cust_002',
    customerName: 'Tech Solutions Oy',
    amount: 99,
    status: 'sent',
    dueDate: '2025-12-20',
    issueDate: '2025-11-20',
    plan: 'professional',
    period: 'December 2025',
    description: 'DocFlow Professional Plan - Monthly subscription',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'inv_003',
    customerId: 'cust_003',
    customerName: 'Globex Corporation',
    amount: 29,
    status: 'overdue',
    dueDate: '2025-11-30',
    issueDate: '2025-10-30',
    plan: 'starter',
    period: 'November 2025',
    description: 'DocFlow Starter Plan - Monthly subscription',
    paymentMethod: 'Invoice'
  },
  {
    id: 'inv_004',
    customerId: 'cust_004',
    customerName: 'Initech',
    amount: 99,
    status: 'cancelled',
    dueDate: '2025-12-01',
    issueDate: '2025-11-01',
    plan: 'professional',
    period: 'December 2025',
    description: 'DocFlow Professional Plan - Monthly subscription',
    paymentMethod: 'Bank Transfer'
  }
]

const mockTransactions: PaymentTransaction[] = [
  {
    id: 'txn_001',
    customerId: 'cust_001',
    customerName: 'Acme Corporation',
    amount: 299,
    status: 'completed',
    date: '2025-11-15T10:30:00Z',
    method: 'card',
    reference: 'ch_1234567890'
  },
  {
    id: 'txn_002',
    customerId: 'cust_002',
    customerName: 'Tech Solutions Oy',
    amount: 99,
    status: 'pending',
    date: '2025-11-20T14:15:00Z',
    method: 'bank_transfer',
    reference: 'BT_987654321'
  },
  {
    id: 'txn_003',
    customerId: 'cust_005',
    customerName: 'New Customer Ltd',
    amount: 49,
    status: 'completed',
    date: '2025-11-19T09:45:00Z',
    method: 'paypal',
    reference: 'PP_555444333'
  }
]

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(mockTransactions)
  const [activeTab, setActiveTab] = useState<'invoices' | 'transactions' | 'mrr'>('mrr')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Calculate metrics
  const totalMRR = invoices
    .filter(inv => inv.status === 'paid' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const monthlyRevenue = transactions
    .filter(txn => txn.status === 'completed')
    .filter(txn => new Date(txn.date).getMonth() === new Date().getMonth())
    .reduce((sum, txn) => sum + txn.amount, 0)

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0)

  const churnRate = 8.5 // Mock data

  const getStatusBadge = (status: Invoice['status'] | PaymentTransaction['status']) => {
    const styles = {
      // Invoice statuses
      draft: 'badge-secondary',
      sent: 'badge-warning',
      paid: 'badge-success',
      overdue: 'badge-destructive',
      cancelled: 'badge-secondary',
      // Transaction statuses
      pending: 'badge-warning',
      completed: 'badge-success',
      failed: 'badge-destructive',
      refunded: 'badge-secondary'
    }
    return <span className={`badge ${styles[status]}`}>{status}</span>
  }

  const getMethodIcon = (method: PaymentTransaction['method']) => {
    const icons = {
      card: '💳',
      bank_transfer: '🏦',
      paypal: '🟦',
      invoice: '📄'
    }
    return icons[method]
  }

  const filteredInvoices = invoices.filter(inv => filterStatus === 'all' || inv.status === filterStatus)
  const filteredTransactions = transactions.filter(txn => filterStatus === 'all' || txn.status === filterStatus)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-medium">Billing & Invoicing</h3>
          <p className="text-sm text-gray-500">
            MRR: €{totalMRR} • Monthly Revenue: €{monthlyRevenue}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="sent">Sent</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button className="btn btn-primary text-sm">
            Generate Invoice
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('mrr')}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === 'mrr' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          MRR Overview
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === 'invoices' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-sm rounded-md ${
            activeTab === 'transactions' ? 'bg-white text-blue-600 shadow' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'mrr' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="metric-value text-green-600">€{totalMRR.toLocaleString()}</div>
              <div className="metric-label">Monthly Recurring Revenue</div>
              <div className="text-xs text-green-600 mt-1">↗ +12.5% vs last month</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value text-blue-600">€{monthlyRevenue.toLocaleString()}</div>
              <div className="metric-label">Revenue This Month</div>
              <div className="text-xs text-blue-600 mt-1">↗ +8.3% vs last month</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value text-red-600">€{overdueAmount}</div>
              <div className="metric-label">Overdue Amount</div>
              <div className="text-xs text-red-600 mt-1">2 invoices overdue</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value text-yellow-600">{churnRate}%</div>
              <div className="metric-label">Monthly Churn Rate</div>
              <div className="text-xs text-yellow-600 mt-1">↗ +1.2% vs last month</div>
            </div>
          </div>

          {/* MRR Breakdown by Plan */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium mb-4">MRR Breakdown by Plan</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-purple-800">Enterprise Plan</div>
                  <div className="text-sm text-purple-600">€299/month • 1 customer</div>
                </div>
                <div className="text-2xl font-bold text-purple-800">€299</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">Professional Plan</div>
                  <div className="text-sm text-blue-600">€99/month • 2 customers</div>
                </div>
                <div className="text-2xl font-bold text-blue-800">€198</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">Starter Plan</div>
                  <div className="text-sm text-gray-600">€29/month • 1 customer</div>
                </div>
                <div className="text-2xl font-bold text-gray-800">€29</div>
              </div>
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-medium mb-4">Revenue Trends (Last 6 Months)</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">November 2025</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium">€526</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">October 2025</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-sm font-medium">€467</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">September 2025</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-sm font-medium">€426</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No invoices found
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium">{invoice.customerName}</h4>
                      {getStatusBadge(invoice.status)}
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {invoice.plan}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {invoice.description} • {invoice.period}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Invoice #{invoice.id} • Due: {new Date(invoice.dueDate).toLocaleDateString('fi-FI')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">€{invoice.amount}</div>
                    {invoice.paidDate && (
                      <div className="text-xs text-green-600">
                        Paid: {new Date(invoice.paidDate).toLocaleDateString('fi-FI')}
                      </div>
                    )}
                    {invoice.paymentMethod && (
                      <div className="text-xs text-gray-500">
                        {invoice.paymentMethod}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{getMethodIcon(transaction.method)}</span>
                      <h4 className="font-medium">{transaction.customerName}</h4>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Reference: {transaction.reference}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.date).toLocaleString('fi-FI')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">€{transaction.amount}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {transaction.method.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}