'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_COUPONS, INITIAL_PROMOTIONS, INITIAL_CAMPAIGNS, INITIAL_EMAIL_TEMPLATES, Coupon } from '@/services/mockData';
import { Plus, Percent, Tag, Megaphone, Mail } from 'lucide-react';

export default function MarketingPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [promotions] = useState(INITIAL_PROMOTIONS);
  const [campaigns] = useState(INITIAL_CAMPAIGNS);
  const [templates] = useState(INITIAL_EMAIL_TEMPLATES);
  const [, startTransition] = useTransition();

  const filteredCoupons = coupons.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase());
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
    { key: 'code', label: 'Coupon Code', sortable: true },
    { key: 'title', label: 'Campaign Title', sortable: true },
    { key: 'discount', label: 'Discount Value', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Marketing" description="Manage coupons, active campaigns, and email promotions.">
        <button
          onClick={() => {
            const code = prompt('Enter Coupon Code:');
            const discount = prompt('Enter Discount (e.g. 20% or $10):');
            if (code && discount) {
              setCoupons([
                { id: crypto.randomUUID(), code, title: 'Custom Campaign', discount, status: 'active' },
                ...coupons,
              ]);
            }
          }}
          className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Add Coupon</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Active Coupons" value={coupons.filter(c => c.status === 'active').length} icon={Tag} />
        <StatsCard title="Active Promotions" value={promotions.filter(p => p.status === 'active').length} icon={Percent} trend={{ value: 25, isPositive: true, label: 'promo rate' }} />
        <StatsCard title="Campaigns" value={campaigns.length} icon={Megaphone} />
        <StatsCard title="Email Templates" value={templates.length} icon={Mail} trend={{ value: 1, isPositive: true, label: 'new template' }} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Marketing Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Coupons</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{coupons.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Active Coupons</span><span className="font-bold text-green-600">{coupons.filter(c => c.status === 'active').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Active Promotions</span><span className="font-bold text-blue-600">{promotions.filter(p => p.status === 'active').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Campaigns</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{campaigns.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Email Templates</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{templates.length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/marketing/coupons" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Coupons</a>
            <a href="/marketing/promotions" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Promotions</a>
            <a href="/marketing/campaigns" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Campaigns</a>
            <a href="/marketing/email-templates" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Email Templates</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search coupon code or title..." />
      </div>

      <AppDataTable
        data={filteredCoupons}
        columns={columns}
        totalItems={filteredCoupons.length}
        rowActions={(row: any) => (
          <AppRowActions onDelete={() => setCoupons(coupons.filter((c) => c.id !== row.id))} />
        )}
      />
    </div>
  );
}
