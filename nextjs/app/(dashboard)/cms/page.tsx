'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import StatsCard from '@/components/shared/StatsCard';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_CMS_PAGES, INITIAL_CMS_SECTIONS } from '@/services/mockData';
import type { CmsPage } from '@/services/mockData';
import { Plus, FileText, CheckCircle, FileEdit, LayoutGrid } from 'lucide-react';

export default function CmsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [pages, setPages] = useState<CmsPage[]>(INITIAL_CMS_PAGES);
  const [sections] = useState(INITIAL_CMS_SECTIONS);
  const [, startTransition] = useTransition();

  const filteredPages = pages.filter((item) => {
    return (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase())
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
    { key: 'title', label: 'Page Title', sortable: true },
    { key: 'slug', label: 'Slug / Path', sortable: true },
    {
      key: 'status',
      label: 'Publishing State',
      sortable: true,
      render: (val) => <StatusBadge status={val === 'published' ? 'published' : 'draft'} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="CMS Pages" description="Modify store text sections, agreements, and layout components.">
        <button
          onClick={() => {
            const title = prompt('Enter Page Title:');
            const slug = prompt('Enter Slug (e.g. contact-us):');
            if (title && slug) {
              setPages([{ id: crypto.randomUUID(), title, slug, status: 'draft' }, ...pages]);
            }
          }}
          className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Add Page</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Pages" value={pages.length} icon={FileText} />
        <StatsCard title="Published" value={pages.filter(p => p.status === 'published').length} icon={CheckCircle} trend={{ value: 66.7, isPositive: true, label: 'published rate' }} />
        <StatsCard title="Draft" value={pages.filter(p => p.status === 'draft').length} icon={FileEdit} />
        <StatsCard title="Sections" value={sections.length} icon={LayoutGrid} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">CMS Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Pages</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{pages.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Published</span><span className="font-bold text-green-600">{pages.filter(p => p.status === 'published').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Draft</span><span className="font-bold text-amber-500">{pages.filter(p => p.status === 'draft').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Active Sections</span><span className="font-bold text-blue-600">{sections.filter(s => s.status === 'active').length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/cms/pages" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">CMS Pages</a>
            <a href="/cms/sections" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Sections</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search page title or slug..." />
      </div>

      <AppDataTable
        data={filteredPages}
        columns={columns}
        totalItems={filteredPages.length}
        rowActions={(row: any) => (
          <AppRowActions
            onDelete={() => setPages(pages.filter((p) => p.id !== row.id))}
            extraActions={[
              {
                label: 'Publish Page',
                onClick: () => setPages(pages.map((p) => (p.id === row.id ? { ...p, status: 'published' } : p))),
              },
            ]}
          />
        )}
      />
    </div>
  );
}
