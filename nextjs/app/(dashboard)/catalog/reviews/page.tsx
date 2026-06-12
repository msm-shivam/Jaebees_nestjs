'use client';

import React, { useState, useTransition, use } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_REVIEWS, Review } from '@/services/mockData';
import { Star, CheckCircle, XCircle } from 'lucide-react';

export default function ReviewsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const page = parseInt((resolvedSearchParams.page as string) || '1', 10);
  const limit = parseInt((resolvedSearchParams.limit as string) || '10', 10);
  const search = (resolvedSearchParams.search as string) || '';
  const status = (resolvedSearchParams.status as string) || '';

  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [, startTransition] = useTransition();

  const filteredReviews = reviews.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.comment.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesStatus;
  });

  const paginatedReviews = filteredReviews.slice((page - 1) * limit, page * limit);

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

  const handleStatusFilter = (val: string) => {
    startTransition(() => {
      updateUrl({ status: val, page: 1 });
    });
  };

  const handleApprove = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
  };

  const handleReject = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
  };

  const handleDelete = (id: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const columns: TableColumn[] = [
    { key: 'productName', label: 'Product', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (val: any) => (
        <div className="flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill={i < Number(val) ? 'currentColor' : 'none'} />
          ))}
        </div>
      ),
    },
    { key: 'comment', label: 'Comment' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val: any) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Monitor customer feedback and approve or reject submissions." />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search product, customer, or comment..." />
        <select
          value={status}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <AppDataTable
        data={paginatedReviews}
        columns={columns}
        totalItems={filteredReviews.length}
        rowActions={(row: any) => (
          <AppRowActions
            onDelete={() => handleDelete(row.id)}
            extraActions={[
              { label: 'Approve', icon: CheckCircle, onClick: () => handleApprove(row.id) },
              { label: 'Reject', icon: XCircle, onClick: () => handleReject(row.id), danger: true },
            ]}
          />
        )}
      />
    </div>
  );
}
