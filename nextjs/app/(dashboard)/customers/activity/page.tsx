'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import { INITIAL_CUSTOMER_ACTIVITIES, CustomerActivity } from '@/services/mockData';

export default function CustomerActivityPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();

  const [activities] = useState<CustomerActivity[]>(INITIAL_CUSTOMER_ACTIVITIES);

  const filtered = activities.filter((item) => {
    const q = search.toLowerCase();
    return item.customerName.toLowerCase().includes(q) || item.details.toLowerCase().includes(q);
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
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'action', label: 'Action', sortable: true, render: (val) => val.charAt(0).toUpperCase() + val.slice(1) },
    { key: 'details', label: 'Details' },
    { key: 'date', label: 'Date', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Activity" description="Track customer actions and interactions." />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search customer name or details..." />
      </div>

      <AppDataTable
        data={filtered}
        columns={columns}
        totalItems={filtered.length}
      />
    </div>
  );
}
