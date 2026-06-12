'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import { INITIAL_STOCK_ADJUSTMENTS, StockAdjustment } from '@/services/mockData';

export default function StockAdjustmentsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();

  const [adjustments] = useState<StockAdjustment[]>(INITIAL_STOCK_ADJUSTMENTS);

  const filtered = adjustments.filter((item) => {
    const q = search.toLowerCase();
    return item.productName.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
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
    { key: 'productName', label: 'Product', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    {
      key: 'adjustment',
      label: 'Adjustment',
      sortable: true,
      render: (val) => {
        const v = val as number;
        const sign = v >= 0 ? '+' : '';
        const color = v >= 0 ? 'text-green-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{sign}{v}</span>;
      },
    },
    { key: 'reason', label: 'Reason' },
    { key: 'date', label: 'Date', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Adjustments" description="Track inventory changes and corrections." />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search product name or SKU..." />
      </div>
      <AppDataTable data={filtered} columns={columns} totalItems={filtered.length} />
    </div>
  );
}
