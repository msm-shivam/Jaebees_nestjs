'use client';

import React from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppPaginationProps {
  totalItems: number;
}

export function AppPagination({ totalItems }: AppPaginationProps) {
  const { getQueryParam, setQueryParams } = useQueryParams();

  const page = parseInt(getQueryParam('page', '1'), 10);
  const limit = parseInt(getQueryParam('limit', '10'), 10);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setQueryParams({ page: newPage });
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParams({
      limit: e.target.value,
      page: 1, // Reset to page 1 on limit change
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200 bg-white py-4 px-6 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Page Limit selector */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span>Rows per page:</span>
        <select
          value={limit}
          onChange={handleLimitChange}
          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        {totalItems > 0 && (
          <span className="ml-2">
            Showing {startItem}-{endItem} of {totalItems} items
          </span>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default AppPagination;
