'use client';

import React, { useTransition, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/layout/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import apiClient from '@/services/api.client';
import type {
  Product,
  CatalogOverview,
  CatalogSummary,
  CatalogQuickLink,
} from '@/services/types';
import { Package, Tags, Building2, Star, BookOpen, BarChart3 } from 'lucide-react';

export default function CatalogPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();

  const { data: overviewRes } = useQuery({
    queryKey: ['catalog-overview'],
    queryFn: () => apiClient.get<{ success: boolean; data: CatalogOverview }>('/admin/catalog/overview').then(r => r.data),
  });

  const { data: summaryRes } = useQuery({
    queryKey: ['catalog-summary'],
    queryFn: () => apiClient.get<{ success: boolean; data: CatalogSummary }>('/admin/catalog/summary').then(r => r.data),
  });

  const { data: linksRes } = useQuery({
    queryKey: ['catalog-quick-links'],
    queryFn: () => apiClient.get<{ success: boolean; data: CatalogQuickLink[] }>('/admin/catalog/quick-links').then(r => r.data),
  });

  const { data: productsRes } = usePaginatedQuery<Product>('products', '/admin/products', { limit: 10, page: 1 });

  const overview = overviewRes?.data;
  const summaryItems = summaryRes?.data?.items || [];
  const links = linksRes?.data || [];
  const products = productsRes?.data?.items || [];
  const totalProducts = productsRes?.data?.total || 0;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearchChange = (val: string) => {
    startTransition(() => {
      const url = new URL(window.location.href);
      if (val) url.searchParams.set('search', val);
      else url.searchParams.delete('search');
      window.history.pushState({}, '', url.toString());
    });
  };

  const summaryColorMap: Record<string, string> = {
    green: 'text-green-600',
    yellow: 'text-yellow-500',
    gray: 'text-zinc-500',
    red: 'text-red-500',
    orange: 'text-orange-500',
  };

  const columns: TableColumn[] = [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Price', sortable: true, render: (val) => `$${val}` },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Catalog" description="Manage your products, categories, brands, and reviews." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Products" value={overview?.totalProducts ?? 0} icon={Package} />
        <StatsCard title="Categories" value={overview?.totalCategories ?? 0} icon={Tags} />
        <StatsCard title="Brands" value={overview?.totalBrands ?? 0} icon={Building2} />
        <StatsCard title="Reviews" value={overview?.totalReviews ?? 0} icon={Star} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Catalog Summary</h3>
          </div>
          <div className="space-y-3">
            {summaryItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">{item.label}</span>
                <span className={`font-bold ${item.color ? summaryColorMap[item.color] : 'text-zinc-800 dark:text-zinc-200'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search products..." />
      </div>

      <AppDataTable data={filtered} columns={columns} totalItems={filtered.length} />
    </div>
  );
}
