'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_SUPPLIERS, Supplier } from '@/services/mockData';

export default function SuppliersPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();

  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);

  const filtered = suppliers.filter((item) => {
    return item.name.toLowerCase().includes(search.toLowerCase());
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
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Suppliers" description="Manage supplier information and relationships." />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search suppliers..." />
      </div>
      <AppDataTable
        data={filtered}
        columns={columns}
        totalItems={filtered.length}
        rowActions={(row: any) => (
          <AppRowActions
            onEdit={() => {}}
            onDelete={() => setSuppliers(suppliers.filter((s) => s.id !== row.id))}
          />
        )}
      />
    </div>
  );
}
