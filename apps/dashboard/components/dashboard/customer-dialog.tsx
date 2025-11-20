'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { api, queryKeys, type Customer } from '@/lib/api'
import { customerSchema, type CustomerFormData } from '@/lib/validations'

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSuccess?: () => void
}

export function CustomerDialog({ 
  open, 
  onOpenChange, 
  customer, 
  onSuccess 
}: CustomerDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!customer

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      companyName: '',
      email: '',
      plan: 'starter',
      status: 'active',
      billingCycle: 'monthly',
      stripeCustomerId: ''
    }
  })

  // Reset form when customer changes
  useEffect(() => {
    if (customer) {
      form.reset({
        companyName: customer.companyName,
        email: customer.email,
        plan: customer.plan,
        status: customer.status,
        billingCycle: customer.billingCycle || 'monthly',
        stripeCustomerId: customer.stripeCustomerId || ''
      })
    } else {
      form.reset({
        companyName: '',
        email: '',
        plan: 'starter',
        status: 'active',
        billingCycle: 'monthly',
        stripeCustomerId: ''
      })
    }
  }, [customer, form])

  const mutation = useMutation({
    mutationFn: (data: CustomerFormData) => {
      if (isEdit && customer) {
        return api.updateCustomer(customer.id, data)
      } else {
        return api.createCustomer(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      toast.success(isEdit ? 'Customer updated successfully' : 'Customer created successfully')
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} customer: ${error.message}`)
    }
  })

  const onSubmit = (data: CustomerFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Customer' : 'New Customer'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              {...form.register('companyName')}
              placeholder="Acme Corp"
              disabled={mutation.isPending}
            />
            {form.formState.errors.companyName && (
              <p className="text-sm text-red-600">
                {form.formState.errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="customer@example.com"
              disabled={mutation.isPending}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan *</Label>
            <Select
              value={form.watch('plan')}
              onValueChange={(value) => form.setValue('plan', value as CustomerFormData['plan'])}
            >
              <SelectTrigger id="plan" disabled={mutation.isPending}>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.plan && (
              <p className="text-sm text-red-600">
                {form.formState.errors.plan.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as CustomerFormData['status'])}
            >
              <SelectTrigger id="status" disabled={mutation.isPending}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-600">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select
              value={form.watch('billingCycle') || 'monthly'}
              onValueChange={(value) => form.setValue('billingCycle', value as 'monthly' | 'annual')}
            >
              <SelectTrigger id="billingCycle" disabled={mutation.isPending}>
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

