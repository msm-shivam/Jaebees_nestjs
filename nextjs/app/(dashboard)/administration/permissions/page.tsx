'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_PERMISSIONS, Permission } from '@/services/mockData';

export default function PermissionsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS);
  const [, startTransition] = useTransition();

  const filtered = permissions.filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase()) ||
      item.module.toLowerCase().includes(search.toLowerCase())
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
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" description="Manage system permissions and their associated modules." />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search name, slug, or module..." />
      </div>

      <AppDataTable
        data={filtered}
        columns={columns}
        totalItems={filtered.length}
        rowActions={(row: any) => (
          <AppRowActions
            onDelete={() => setPermissions(permissions.filter((p) => p.id !== row.id))}
          />
        )}
      />
    </div>
  );
}
