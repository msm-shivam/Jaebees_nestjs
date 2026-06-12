'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_AUDIT_LOGS, AuditLog } from '@/services/mockData';

export default function AuditLogsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [logs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [, startTransition] = useTransition();

  const filtered = logs.filter((item) => {
    return (
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase()) ||
      item.resource.toLowerCase().includes(search.toLowerCase()) ||
      item.details.toLowerCase().includes(search.toLowerCase())
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
    { key: 'resource', label: 'Resource', sortable: true },
    { key: 'details', label: 'Details' },
    { key: 'timestamp', label: 'Timestamp', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Track all administrative actions across the system." />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search user, action, resource, or details..." />
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
