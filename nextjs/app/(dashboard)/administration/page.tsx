'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import StatsCard from '@/components/shared/StatsCard';
import { INITIAL_ADMIN_USERS, INITIAL_ROLES, INITIAL_PERMISSIONS, AdminUser } from '@/services/mockData';
import { ShieldAlert, UserPlus, ShieldCheck, Users, Key, ClipboardList } from 'lucide-react';

export default function AdministrationPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [roles] = useState(INITIAL_ROLES);
  const [permissions] = useState(INITIAL_PERMISSIONS);
  const [, startTransition] = useTransition();

  const filteredUsers = users.filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.role.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSearchChange = (val: string) => {
    startTransition(() => {
      const url = new URL(window.location.href);
      if (val) url.searchParams.set('search', val);
      else url.searchParams.delete('search');
      window.history.pushState({}, '', url.toString());
    });
  };

  const columns: TableColumn[] = [
    { key: 'name', label: 'Operator Name', sortable: true },
    { key: 'email', label: 'System Email', sortable: true },
    { key: 'role', label: 'Security Role', sortable: true },
    {
      key: 'status',
      label: 'Operator Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Administration" description="Assign security roles, inspect audit trails, and manage operators.">
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
          <span>Add Operator</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Users" value={users.length} icon={Users} />
        <StatsCard title="Active" value={users.filter(u => u.status === 'active').length} icon={ShieldCheck} trend={{ value: 75, isPositive: true, label: 'active rate' }} />
        <StatsCard title="Security Roles" value={roles.length} icon={Key} />
        <StatsCard title="Permissions" value={permissions.length} icon={ClipboardList} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Administration Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Users</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{users.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Active</span><span className="font-bold text-green-600">{users.filter(u => u.status === 'active').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Inactive</span><span className="font-bold text-red-500">{users.filter(u => u.status === 'inactive').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Security Roles</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{roles.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Permissions</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{permissions.length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/administration/users" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Users</a>
            <a href="/administration/roles" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Roles</a>
            <a href="/administration/permissions" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Permissions</a>
            <a href="/administration/audit-logs" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Audit Logs</a>
            <a href="/administration/security-logs" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Security Logs</a>
            <a href="/administration/privacy-requests" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Privacy Requests</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search operator name, email, or role..." />
      </div>

      <AppDataTable
        data={filteredUsers}
        columns={columns}
        totalItems={filteredUsers.length}
        rowActions={(row: any) => (
          <AppRowActions
            onDelete={() => setUsers(users.filter((u) => u.id !== row.id))}
            extraActions={[
              {
                label: 'Deactivate Account',
                icon: ShieldAlert,
                onClick: () => setUsers(users.map((u) => (u.id === row.id ? { ...u, status: 'inactive' } : u))),
                danger: true,
              },
            ]}
          />
        )}
      />
    </div>
  );
}
