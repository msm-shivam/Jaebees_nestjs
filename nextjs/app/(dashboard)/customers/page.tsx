'use client';

import React, { useState, useTransition, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import AppDrawer from '@/components/modal/AppDrawer';
import AppInput from '@/components/form/AppInput';
import AppSelect from '@/components/form/AppSelect';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import StatsCard from '@/components/shared/StatsCard';
import { INITIAL_CUSTOMERS, Customer } from '@/services/mockData';
import { Plus, Users, UserCheck, UserX, UserPlus } from 'lucide-react';

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  status: z.enum(['active', 'inactive']),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const status = (resolvedSearchParams.status as string) || '';
  const [, startTransition] = useTransition();

  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', email: '', phone: '', status: 'active' },
  });

  const filteredCustomers = customers.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesStatus;
  });

  const updateUrl = (newParams: Record<string, string | number | null>) => {
    const url = new URL(window.location.href);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') url.searchParams.delete(k);
      else url.searchParams.set(k, String(v));
    });
    window.history.pushState({}, '', url.toString());
  };

  const handleSearchChange = (val: string) => {
    startTransition(() => {
      updateUrl({ search: val, page: 1 });
    });
  };

  const handleStatusFilter = (val: string) => {
    startTransition(() => {
      updateUrl({ status: val, page: 1 });
    });
  };

  const handleOpenAddDrawer = () => {
    setEditingCustomer(null);
    reset({ name: '', email: '', phone: '', status: 'active' });
    setDrawerOpen(true);
  };

  const handleOpenEditDrawer = (cust: Customer) => {
    setEditingCustomer(cust);
    reset({ name: cust.name, email: cust.email, phone: cust.phone, status: cust.status });
    setDrawerOpen(true);
  };

  const handleSave = (values: CustomerFormValues) => {
    if (editingCustomer) {
      setCustomers(
        customers.map((c) => (c.id === editingCustomer.id ? { ...c, ...values } : c))
      );
    } else {
      setCustomers([
        {
          id: crypto.randomUUID(),
          ...values,
          registrationDate: new Date().toISOString().split('T')[0],
        },
        ...customers,
      ]);
    }
    setDrawerOpen(false);
  };

  const columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'registrationDate', label: 'Registered On', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="View customer directories and verify registrations.">
        <button
          onClick={handleOpenAddDrawer}
          className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Customers" value={customers.length} icon={Users} />
        <StatsCard title="Active" value={customers.filter(c => c.status === 'active').length} icon={UserCheck} trend={{ value: 8.3, isPositive: true, label: 'active rate' }} />
        <StatsCard title="Inactive" value={customers.filter(c => c.status === 'inactive').length} icon={UserX} />
        <StatsCard title="New This Month" value={customers.filter(c => c.registrationDate >= '2026-06-01').length} icon={UserPlus} trend={{ value: 2, isPositive: true, label: 'new registrations' }} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Customer Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Customers</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{customers.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Active</span><span className="font-bold text-green-600">{customers.filter(c => c.status === 'active').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Inactive</span><span className="font-bold text-red-500">{customers.filter(c => c.status === 'inactive').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">New This Month</span><span className="font-bold text-blue-600">{customers.filter(c => c.registrationDate >= '2026-06-01').length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/customers/activity" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Customer Activity</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search name, email, or phone..." />
        <select
          value={status}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <AppDataTable
        data={filteredCustomers}
        columns={columns}
        totalItems={filteredCustomers.length}
        rowActions={(row: any) => (
          <AppRowActions
            onEdit={() => handleOpenEditDrawer(row)}
            onDelete={() => setCustomers(customers.filter((c) => c.id !== row.id))}
          />
        )}
      />

      <AppDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <AppInput label="Customer Name" register={register('name')} error={errors.name?.message} />
          <AppInput label="Email" type="email" register={register('email')} error={errors.email?.message} />
          <AppInput label="Phone" register={register('phone')} error={errors.phone?.message} />
          <AppSelect
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            register={register('status')}
            error={errors.status?.message}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-500 transition-colors"
            >
              Save Customer
            </button>
          </div>
        </form>
      </AppDrawer>
    </div>
  );
}
