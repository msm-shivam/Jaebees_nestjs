'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, Product } from '@/services/mockData';
import { Package, Tags, Building2, Star } from 'lucide-react';

export default function CatalogPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [, startTransition] = useTransition();
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

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

  const totalProducts = products.length;
  const totalCategories = INITIAL_CATEGORIES.length;
  const totalBrands = INITIAL_BRANDS.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const outOfStock = products.filter((p) => p.status === 'out of stock').length;
  const avgRating = 4.2;

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
        <StatsCard title="Total Products" value={totalProducts} icon={Package} />
        <StatsCard title="Active Products" value={activeProducts} icon={Star} trend={{ value: 8.3, isPositive: true, label: 'vs last month' }} />
        <StatsCard title="Categories" value={totalCategories} icon={Tags} />
        <StatsCard title="Brands" value={totalBrands} icon={Building2} trend={{ value: 2, isPositive: true, label: 'new this month' }} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Catalog Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Total Products</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalProducts}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Active</span>
              <span className="font-bold text-green-600">{activeProducts}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Out of Stock</span>
              <span className="font-bold text-red-500">{outOfStock}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Categories</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalCategories}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Brands</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{totalBrands}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Avg. Rating</span>
              <span className="font-bold text-amber-500">{avgRating} / 5</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/catalog/products" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">
              Products
            </a>
            <a href="/catalog/categories" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">
              Categories
            </a>
            <a href="/catalog/brands" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">
              Brands
            </a>
            <a href="/catalog/reviews" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">
              Reviews
            </a>
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
