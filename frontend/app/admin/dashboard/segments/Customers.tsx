/** @fileoverview Customers - Manage customer relationships and interactions */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTenantFeed } from '@/lib/admin/hooks/useTenantFeed';
import { useAuthedFetch } from '@/lib/admin/hooks/useAuthedFetch';
import { useToast } from '@/components/admin/ui/useToast';
import { EmptyState, ErrorState, LoadingState, Button } from '@/components/admin/ui/CommonStates';

interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  lastActivity?: string;
  totalDocuments?: number;
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  monthlyValue: number;
  joinDate: string;
  lastContact?: string;
  notes?: string;
  tenantId: string;
}

interface CustomerStats {
  total: number;
  active: number;
  trial: number;
  suspended: number;
  totalRevenue: number;
  avgMonthlyValue: number;
  newThisMonth: number;
}

export default function Customers() {
  const adminToken = typeof window !== 'undefined' ? (window as any).__ADMIN_TOKEN__ || '' : '';
  
  const { status, events, getEventsByType } = useTenantFeed(
    process.env.NEXT_PUBLIC_WS_URL,
    adminToken,
    'tenant-1'
  );
  
  const fetcher = useAuthedFetch(adminToken);
  const { show, Toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    active: 0,
    trial: 0,
    suspended: 0,
    totalRevenue: 0,
    avgMonthlyValue: 0,
    newThisMonth: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastActivity' | 'monthlyValue'>('name');
  
  // Contact modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [isContacting, setIsContacting] = useState(false);
  
  // Environment-based contact availability
  const canContact = Boolean(
    process.env.NEXT_PUBLIC_CAN_CONTACT || 
    process.env.RESEND_API_KEY ||
    typeof window !== 'undefined' && (window as any).__RESEND_AVAILABLE__
  );

  // Filter customer-related events from real-time feed
  const customerEvents = useMemo(() => {
    return getEventsByType([
      'customer_registered', 
      'customer_login', 
      'customer_activity', 
      'customer_upgrade', 
      'customer_downgrade',
      'customer_contacted'
    ]);
  }, [getEventsByType]);

  // Load initial customer data
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetcher('/api/admin/customers');
        setCustomers(response.data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    };

    if (adminToken) {
      loadCustomers();
    }
  }, [adminToken, fetcher]);

  // Process real-time events and update customer data
  useEffect(() => {
    customerEvents.forEach(event => {
      const customerId = event.details?.customerId || event.details?.userId;
      if (!customerId) return;

      setCustomers(current => {
        const existingIndex = current.findIndex(c => c.id === customerId);
        
        if (event.type === 'customer_registered') {
          const newCustomer: Customer = {
            id: customerId,
            name: event.details?.name || 'Unknown User',
            email: event.details?.email || '',
            company: event.details?.company,
            status: 'trial',
            plan: 'free',
            monthlyValue: 0,
            joinDate: event.ts,
            lastActivity: event.ts,
            tenantId: event.tenant_id
          };
          
          if (existingIndex >= 0) {
            // Update existing customer
            current[existingIndex] = { ...current[existingIndex], ...newCustomer };
            return [...current];
          } else {
            // Add new customer
            return [newCustomer, ...current];
          }
        } else if (event.type === 'customer_activity' || event.type === 'customer_login') {
          if (existingIndex >= 0) {
            current[existingIndex].lastActivity = event.ts;
            return [...current];
          }
        } else if (event.type === 'customer_upgrade' || event.type === 'customer_downgrade') {
          if (existingIndex >= 0) {
            current[existingIndex].plan = event.details?.plan || current[existingIndex].plan;
            current[existingIndex].monthlyValue = event.details?.monthlyValue || current[existingIndex].monthlyValue;
            current[existingIndex].lastActivity = event.ts;
            return [...current];
          }
        }
        
        return current;
      });
    });
  }, [customerEvents]);

  // Calculate stats
  useEffect(() => {
    const newStats: CustomerStats = {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      trial: customers.filter(c => c.status === 'trial').length,
      suspended: customers.filter(c => c.status === 'suspended').length,
      totalRevenue: customers.reduce((sum, c) => sum + c.monthlyValue, 0),
      avgMonthlyValue: customers.length > 0 
        ? customers.reduce((sum, c) => sum + c.monthlyValue, 0) / customers.length 
        : 0,
      newThisMonth: customers.filter(c => {
        const joinDate = new Date(c.joinDate);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length
    };
    setStats(newStats);
  }, [customers]);

  const openContactModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setContactEmail(customer.email);
    setContactSubject('');
    setContactMessage('');
    setContactModalOpen(true);
  };

  const closeContactModal = () => {
    setContactModalOpen(false);
    setSelectedCustomer(null);
    setContactEmail('');
    setContactSubject('');
    setContactMessage('');
    setIsContacting(false);
  };

  const sendContact = async () => {
    if (!selectedCustomer || !contactEmail || isContacting) return;

    setIsContacting(true);
    
    // Optimistic update
    setCustomers(current => 
      current.map(c => 
        c.id === selectedCustomer.id 
          ? { ...c, lastContact: new Date().toISOString() }
          : c
      )
    );

    try {
      const response = await fetcher('/api/admin/customers/contact', {
        method: 'POST',
        body: JSON.stringify({ 
          customerId: selectedCustomer.id,
          email: contactEmail,
          subject: contactSubject || undefined,
          message: contactMessage || undefined
        })
      });
      
      show(`Contact sent to ${selectedCustomer.name}`, 'success');
      closeContactModal();
    } catch (err) {
      // Restore on error
      setCustomers(current => 
        current.map(c => 
          c.id === selectedCustomer.id 
            ? { ...c, lastContact: undefined }
            : c
        )
      );
      show((err as Error).message || 'Failed to send contact', 'error');
    } finally {
      setIsContacting(false);
    }
  };

  const updatePlan = async (customer: Customer, newPlan: Customer['plan']) => {
    try {
      setCustomers(current => 
        current.map(c => 
          c.id === customer.id 
            ? { 
                ...c, 
                plan: newPlan, 
                monthlyValue: getPlanPrice(newPlan),
                status: newPlan === 'free' ? 'trial' : 'active'
              }
            : c
        )
      );
      
      const response = await fetcher('/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'update_plan', 
          customerId: customer.id,
          plan: newPlan
        })
      });
      
      show(`${customer.name} plan updated to ${newPlan}`, 'success');
    } catch (err) {
      // Restore on error
      setCustomers(current => 
        current.map(c => 
          c.id === customer.id 
            ? { 
                ...c, 
                plan: customer.plan, 
                monthlyValue: customer.monthlyValue,
                status: customer.status
              }
            : c
        )
      );
      show((err as Error).message || 'Failed to update plan', 'error');
    }
  };

  const suspend = async (customer: Customer) => {
    if (!confirm(`Suspend customer ${customer.name}?`)) {
      return;
    }

    try {
      setCustomers(current => 
        current.map(c => 
          c.id === customer.id 
            ? { ...c, status: 'suspended' as const }
            : c
        )
      );
      
      const response = await fetcher('/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'suspend', 
          customerId: customer.id
        })
      });
      
      show(`${customer.name} suspended`, 'warning');
    } catch (err) {
      // Restore on error
      setCustomers(current => 
        current.map(c => 
          c.id === customer.id 
            ? { ...c, status: customer.status }
            : c
        )
      );
      show((err as Error).message || 'Failed to suspend customer', 'error');
    }
  };

  const getPlanPrice = (plan: Customer['plan']): number => {
    const prices = { free: 0, basic: 29, pro: 99, enterprise: 299 };
    return prices[plan];
  };

  const getStatusBadge = (status: Customer['status']) => {
    const badges = {
      active: { text: 'Active', className: 'bg-green-100 text-green-800' },
      trial: { text: 'Trial', className: 'bg-blue-100 text-blue-800' },
      inactive: { text: 'Inactive', className: 'bg-gray-100 text-gray-800' },
      suspended: { text: 'Suspended', className: 'bg-red-100 text-red-800' }
    };
    return badges[status];
  };

  const getPlanBadge = (plan: Customer['plan']) => {
    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-800' },
      basic: { text: 'Basic', className: 'bg-blue-100 text-blue-800' },
      pro: { text: 'Pro', className: 'bg-purple-100 text-purple-800' },
      enterprise: { text: 'Enterprise', className: 'bg-yellow-100 text-yellow-800' }
    };
    return badges[plan];
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('fi-FI');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fi-FI', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      if (statusFilter !== 'all' && customer.status !== statusFilter) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          (customer.company?.toLowerCase().includes(searchLower) || false)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'lastActivity':
          return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
        case 'monthlyValue':
          return b.monthlyValue - a.monthlyValue;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status.status === 'connected' ? 'bg-green-500' :
              status.status === 'connecting' ? 'bg-yellow-500' :
              status.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              {status.status === 'connected' ? '🟢 Live' : 
               status.status === 'connecting' ? '🟡 Connecting...' :
               status.status === 'error' ? '🔴 Error' : '⚪ Offline'}
            </span>
          </div>
        </div>
        <LoadingState count={5} message="Loading customers..." />
        <Toast />
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer relationships and subscriptions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status.status === 'connected' ? 'bg-green-500' :
              status.status === 'connecting' ? 'bg-yellow-500' :
              status.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              {status.status === 'connected' ? '🟢 Live' : 
               status.status === 'connecting' ? '🟡 Connecting...' :
               status.status === 'error' ? '🔴 Error' : '⚪ Offline'}
            </span>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            size="sm" 
            variant="secondary"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-gray-600">Total Customers</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-gray-600">Active</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.trial}</div>
          <div className="text-xs text-gray-600">Trial</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</div>
          <div className="text-xs text-gray-600">Monthly Revenue</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="lastActivity">Sort by Last Activity</option>
          <option value="monthlyValue">Sort by Value</option>
        </select>
      </div>

      {error && (
        <ErrorState 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
      )}

      {!loading && filteredCustomers.length === 0 && !error && (
        <EmptyState 
          icon="👥"
          title="No Customers Found"
          description={searchTerm || statusFilter !== 'all' 
            ? "No customers match your search criteria." 
            : "No customers registered yet."
          }
        />
      )}

      {filteredCustomers.length > 0 && (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => {
                  const statusBadge = getStatusBadge(customer.status);
                  const planBadge = getPlanBadge(customer.plan);
                  
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.email}
                          </div>
                          {customer.company && (
                            <div className="text-xs text-gray-400">
                              {customer.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.className}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${planBadge.className}`}>
                          {planBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.monthlyValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(customer.lastActivity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {canContact && (
                            <Button
                              size="sm"
                              onClick={() => openContactModal(customer)}
                              variant="primary"
                            >
                              📧 Contact
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              const plans: Customer['plan'][] = ['free', 'basic', 'pro', 'enterprise'];
                              const currentIndex = plans.indexOf(customer.plan);
                              const nextPlan = plans[(currentIndex + 1) % plans.length];
                              updatePlan(customer, nextPlan);
                            }}
                            variant="secondary"
                          >
                            🔄 Change Plan
                          </Button>
                          {customer.status !== 'suspended' && (
                            <Button
                              size="sm"
                              onClick={() => suspend(customer)}
                              variant="danger"
                            >
                              ⏸️ Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[520px] max-w-[95vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Customer</h3>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Customer</div>
                <div className="font-medium text-gray-900">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-500">{selectedCustomer.company}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (optional)
                </label>
                <input
                  type="text"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Regarding your DocFlow account"
                  maxLength={140}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-28"
                  placeholder="Write a message to the customer..."
                  maxLength={5000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {contactMessage.length}/5000 characters
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                size="sm"
                onClick={closeContactModal}
                variant="secondary"
                disabled={isContacting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={sendContact}
                variant="primary"
                disabled={!contactEmail || isContacting}
              >
                {isContacting ? '⏳ Sending...' : '📧 Send'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast />
    </section>
  );
}