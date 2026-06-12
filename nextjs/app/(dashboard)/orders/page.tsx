'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_ORDERS, Order } from '@/services/mockData';
import StatsCard from '@/components/shared/StatsCard';
import { Check, Truck, XCircle, ShoppingCart, CheckCircle, Clock, DollarSign } from 'lucide-react';

export default function OrdersPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const status = (resolvedSearchParams.status as string) || '';
  const paymentStatus = (resolvedSearchParams.paymentStatus as string) || '';
  const [, startTransition] = useTransition();

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Filter orders
  const filteredOrders = orders.filter((item) => {
    const matchesSearch =
      item.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || item.status === status;
    const matchesPayment = !paymentStatus || item.paymentStatus === paymentStatus;
    return matchesSearch && matchesStatus && matchesPayment;
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

  const handlePaymentFilter = (val: string) => {
    startTransition(() => {
      updateUrl({ paymentStatus: val, page: 1 });
    });
  };

  // Actions
  const handleMarkShipped = (id: string) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: 'processing' } : o)));
  };

  const handleMarkDelivered = (id: string) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: 'delivered', paymentStatus: 'paid' } : o)));
  };

  const handleCancelOrder = (id: string) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)));
  };

  const columns: TableColumn[] = [
    { key: 'orderNumber', label: 'Order #', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'amount',
      label: 'Total Amount',
      sortable: true,
      render: (val) => `$${Number(val).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Delivery Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    { key: 'date', label: 'Date', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Fulfill customer checkouts, shipments, and returns." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Orders" value={orders.length} icon={ShoppingCart} />
        <StatsCard title="Delivered" value={orders.filter(o => o.status === 'delivered').length} icon={CheckCircle} trend={{ value: 15.2, isPositive: true, label: 'completion rate' }} />
        <StatsCard title="Pending" value={orders.filter(o => o.status === 'pending').length} icon={Clock} />
        <StatsCard title="Revenue" value={'$' + orders.reduce((sum, o) => sum + o.amount, 0).toFixed(2)} icon={DollarSign} trend={{ value: 8.5, isPositive: true, label: 'total sales' }} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Orders Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Orders</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{orders.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Delivered</span><span className="font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Processing</span><span className="font-bold text-blue-600">{orders.filter(o => o.status === 'processing').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Pending</span><span className="font-bold text-amber-500">{orders.filter(o => o.status === 'pending').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Cancelled</span><span className="font-bold text-red-500">{orders.filter(o => o.status === 'cancelled').length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/orders/shipments" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Shipments</a>
            <a href="/orders/returns" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Returns</a>
          </div>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search order #, customer, phone..." />

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="">All Deliveries</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => handlePaymentFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <AppDataTable
        data={filteredOrders}
        columns={columns}
        totalItems={filteredOrders.length}
        rowActions={(row: any) => (
          <AppRowActions
            extraActions={[
              { label: 'Ship Order', icon: Truck, onClick: () => handleMarkShipped(row.id) },
              { label: 'Mark Delivered', icon: Check, onClick: () => handleMarkDelivered(row.id) },
              { label: 'Cancel Order', icon: XCircle, onClick: () => handleCancelOrder(row.id), danger: true },
            ]}
          />
        )}
      />
    </div>
  );
}
