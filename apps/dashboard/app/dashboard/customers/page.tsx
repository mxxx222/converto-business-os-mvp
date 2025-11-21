'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, queryKeys, type Customer } from '@/lib/api'
import { CustomersTable } from '@/components/dashboard/customers-table'
import { CustomerDialog } from '@/components/dashboard/customer-dialog'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CustomersPage() {
  const [filters, setFilters] = useState({ status: 'all', search: '' })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const { data: customers, isLoading, error } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => api.getCustomers(),
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
  })

  const handleCreate = () => {
    setEditingCustomer(null)
    setDialogOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    setDialogOpen(false)
    setEditingCustomer(null)
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Failed to load customers</h3>
              <p className="text-sm text-red-700 mt-1">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage customer accounts and subscriptions
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Customer
        </Button>
      </div>

      <CustomersTable
        customers={customers || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onCreate={handleCreate}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

