'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_SECURITY_LOGS, SecurityLog } from '@/services/mockData';

export default function SecurityLogsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [logs] = useState<SecurityLog[]>(INITIAL_SECURITY_LOGS);
  const [, startTransition] = useTransition();

  const filtered = logs.filter((item) => {
    return (
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase()) ||
      item.ipAddress.toLowerCase().includes(search.toLowerCase())
    );
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
    { key: 'user', label: 'User', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'ipAddress', label: 'IP Address', sortable: true },
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Security Logs" description="Monitor authentication and security-related events." />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search user, action, or IP address..." />
      </div>

      <AppDataTable
        data={filtered}
        columns={columns}
        totalItems={filtered.length}
        rowActions={() => <AppRowActions />}
      />
    </div>
  );
}
