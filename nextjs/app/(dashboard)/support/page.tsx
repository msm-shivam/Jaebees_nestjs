'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_TICKETS, Ticket } from '@/services/mockData';
import StatsCard from '@/components/shared/StatsCard';
import { LifeBuoy, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function SupportPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [, startTransition] = useTransition();

  const filteredTickets = tickets.filter((item) => {
    const matchesSearch =
      item.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
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
    { key: 'ticketNumber', label: 'Ticket #', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'email', label: 'Email' },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (val) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          val === 'high' ? 'bg-red-50 text-red-600 border border-red-500/20' : 'bg-zinc-100 text-zinc-600'
        }`}>
          {String(val).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="Resolve customer queries and monitor tickets." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Tickets" value={tickets.length} icon={LifeBuoy} />
        <StatsCard title="Open" value={tickets.filter(t => t.status === 'open').length} icon={Clock} trend={{ value: 33, isPositive: false, label: 'needs attention' }} />
        <StatsCard title="Resolved" value={tickets.filter(t => t.status === 'resolved').length} icon={CheckCircle} trend={{ value: 50, isPositive: true, label: 'resolution rate' }} />
        <StatsCard title="High Priority" value={tickets.filter(t => t.priority === 'high').length} icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Support Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Tickets</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{tickets.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Open</span><span className="font-bold text-blue-600">{tickets.filter(t => t.status === 'open').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Resolved</span><span className="font-bold text-green-600">{tickets.filter(t => t.status === 'resolved').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">High Priority</span><span className="font-bold text-red-500">{tickets.filter(t => t.priority === 'high').length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/support/tickets" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Tickets</a>
            <a href="/support/analytics" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Analytics</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search ticket #, customer, or email..." />
      </div>

      <AppDataTable
        data={filteredTickets}
        columns={columns}
        totalItems={filteredTickets.length}
        rowActions={(row: any) => (
          <AppRowActions
            extraActions={[
              {
                label: 'Resolve Ticket',
                icon: CheckCircle,
                onClick: () => setTickets(tickets.map((t) => (t.id === row.id ? { ...t, status: 'resolved' } : t))),
              },
            ]}
          />
        )}
      />
    </div>
  );
}
