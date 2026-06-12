'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import { INITIAL_PURCHASE_ORDERS, PurchaseOrder } from '@/services/mockData';

export default function PurchaseOrdersPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();

  const [orders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);

  const filtered = orders.filter((item) => {
    return item.poNumber.toLowerCase().includes(search.toLowerCase());
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

  const columns: TableColumn[] = [
    { key: 'poNumber', label: 'PO Number', sortable: true },
    { key: 'supplier', label: 'Supplier', sortable: true },
    { key: 'orderDate', label: 'Order Date', sortable: true },
    {
      key: 'totalAmount',
      label: 'Total',
      sortable: true,
      render: (val) => `$${(val as number).toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Purchase Orders" description="Track and manage purchase orders with suppliers." />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search PO number..." />
      </div>
      <AppDataTable data={filtered} columns={columns} totalItems={filtered.length} />
    </div>
  );
}
