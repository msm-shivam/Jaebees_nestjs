'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import { INITIAL_SUPPORT_ANALYTICS, SupportAnalytics } from '@/services/mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();

  const [analytics] = useState<SupportAnalytics[]>(INITIAL_SUPPORT_ANALYTICS);

  const filtered = analytics.filter((item) => {
    return item.metric.toLowerCase().includes(search.toLowerCase());
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
    { key: 'metric', label: 'Metric', sortable: true },
    { key: 'value', label: 'Value', sortable: true },
    {
      key: 'trend',
      label: 'Trend',
      sortable: true,
      render: (val) => {
        const isUp = val === 'up';
        const Icon = isUp ? TrendingUp : TrendingDown;
        return (
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            <Icon size={16} />
            {isUp ? 'Up' : 'Down'}
          </span>
        );
      },
    },
    { key: 'period', label: 'Period' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="View support analytics and performance metrics." />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search metric..." />
      </div>

      <AppDataTable
        data={filtered}
        columns={columns}
        totalItems={filtered.length}
      />
    </div>
  );
}
