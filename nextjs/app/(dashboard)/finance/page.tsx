'use client';

import React, { useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import StatsCard from '@/components/shared/StatsCard';
import { DollarSign, CheckCircle, XCircle, ArrowDownUp } from 'lucide-react';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import type { Transaction } from '@/services/types';

export default function FinancePage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();

  const { data: financeRes } = usePaginatedQuery<Transaction>('finance', '/admin/finance/transactions', { limit: 5, page: 1 });
  const txns = financeRes?.data?.items || [];
  const totalTransactions = financeRes?.data?.total || 0;

  const filteredTxns = txns.filter((item) => {
    return item.transactionNumber.toLowerCase().includes(search.toLowerCase());
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
    { key: 'transactionNumber', label: 'Transaction #', sortable: true },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (val) => `$${Number(val).toFixed(2)}`,
    },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Monitor business ledger, payments, and refunds." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Transactions" value={totalTransactions} icon={ArrowDownUp} />
        <StatsCard title="Successful" value={txns.filter(t => t.status === 'success').length} icon={CheckCircle} trend={{ value: 66.7, isPositive: true, label: 'success rate' }} />
        <StatsCard title="Failed" value={txns.filter(t => t.status === 'failed').length} icon={XCircle} />
        <StatsCard title="Total Revenue" value={'$' + txns.filter(t => t.type === 'sale').reduce((s, t) => s + t.amount, 0).toFixed(2)} icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Finance Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Transactions</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{totalTransactions}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Successful</span><span className="font-bold text-green-600">{txns.filter(t => t.status === 'success').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Pending</span><span className="font-bold text-amber-500">{txns.filter(t => t.status === 'pending').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Failed</span><span className="font-bold text-red-500">{txns.filter(t => t.status === 'failed').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Sales</span><span className="font-bold text-zinc-800 dark:text-zinc-200">${txns.filter(t => t.type === 'sale').reduce((s, t) => s + t.amount, 0).toFixed(2)}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/finance/transactions" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Transactions</a>
            <a href="/finance/settlements" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Settlements</a>
            <a href="/finance/expenses" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Expenses</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search transaction #..." />
      </div>

      <AppDataTable data={filteredTxns} columns={columns} totalItems={filteredTxns.length} />
    </div>
  );
}
