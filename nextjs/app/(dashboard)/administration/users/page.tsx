'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_ADMIN_USERS, AdminUser } from '@/services/mockData';
import { Shield, UserPlus } from 'lucide-react';

export default function AdminUsersPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [, startTransition] = useTransition();

  const filtered = users.filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.role.toLowerCase().includes(search.toLowerCase())
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
    { key: 'name', label: 'Operator Name', sortable: true },
    { key: 'email', label: 'System Email', sortable: true },
    { key: 'role', label: 'Security Role', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Users" description="Manage system administrators and their access levels.">
        <button
          onClick={() => {
            const name = prompt('Enter Operator Name:');
            const email = prompt('Enter System Email:');
            const role = prompt('Enter Security Role (e.g. Support Agent, Editor):');
            if (name && email && role) {
              setUsers([{ id: crypto.randomUUID(), name, email, role, status: 'active' }, ...users]);
            }
          }}
          className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          <span>Add User</span>
        </button>
      </PageHeader>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search name, email, or role..." />
      </div>

      <AppDataTable
        data={filtered}
        columns={columns}
        totalItems={filtered.length}
        rowActions={(row: any) => (
          <AppRowActions
            onDelete={() => setUsers(users.filter((u) => u.id !== row.id))}
            extraActions={[
              {
                label: 'Toggle Status',
                icon: Shield,
                onClick: () => setUsers(users.map((u) => (u.id === row.id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))),
              },
            ]}
          />
        )}
      />
    </div>
  );
}
