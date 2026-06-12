'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_TICKETS, Ticket } from '@/services/mockData';
import { CheckCircle } from 'lucide-react';

export default function TicketsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();

  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  const filtered = tickets.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.ticketNumber.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q)
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
    { key: 'ticketNumber', label: 'Ticket #', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'email', label: 'Email' },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val) => {
        const colorMap: Record<string, string> = {
          high: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-500/20',
          medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/20',
          low: 'bg-zinc-50 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-500/20',
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorMap[val] || colorMap.low}`}>
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </span>
        );
      },
    },
    { key: 'status', label: 'Status', sortable: true, render: (val) => <StatusBadge status={val} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Tickets" description="Manage support tickets and customer inquiries." />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search ticket number, customer, or email..." />
      </div>

      <AppDataTable
        data={filtered}
        columns={columns}
        totalItems={filtered.length}
        rowActions={(row: any) => (
          <AppRowActions
            extraActions={[
              {
                label: 'Resolve Ticket',
                icon: CheckCircle,
                onClick: () =>
                  setTickets(tickets.map((t) => (t.id === row.id ? { ...t, status: 'resolved' } : t))),
              },
            ]}
          />
        )}
      />
    </div>
  );
}
