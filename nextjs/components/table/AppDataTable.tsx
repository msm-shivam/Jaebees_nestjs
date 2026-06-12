'use client';

import React, { useState } from 'react';
import AppPagination from './AppPagination';
import { EmptyState } from '../shared/EmptyState';
import LoadingState from '../shared/LoadingState';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (val: any, row: any) => React.ReactNode;
}

interface AppDataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  columns: TableColumn[];
  totalItems: number;
  loading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rowActions?: (row: any) => React.ReactNode;
}

export function AppDataTable({
  data,
  columns,
  totalItems,
  loading = false,
  selectedIds = [],
  onSelectionChange,
  onSort,
  rowActions,
}: AppDataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const visibleColumns = columns.filter((col) => col.visible !== false);

  const handleSort = (key: string) => {
    if (!onSort) return;
    let nextDirection: 'asc' | 'desc' = 'asc';
    if (sortKey === key) {
      nextDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortKey(key);
    setSortDirection(nextDirection);
    onSort(key, nextDirection);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(data.map((item) => String(item.id)));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((x) => x !== id));
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <div className="flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
      {/* Scrollable table view */}
      <div className="overflow-x-auto w-full">
        {loading ? (
          <LoadingState />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                {/* Select All Checkbox */}
                {onSelectionChange && (
                  <th className="py-3 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="accent-orange-600 rounded"
                    />
                  </th>
                )}

                {/* Headers */}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`py-3 px-4 font-bold text-zinc-500 dark:text-zinc-400 select-none ${
                      col.sortable ? 'cursor-pointer hover:text-zinc-950 dark:hover:text-zinc-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span>
                          {sortKey !== col.key ? (
                            <ArrowUpDown size={13} className="text-zinc-400" />
                          ) : sortDirection === 'asc' ? (
                            <ArrowUp size={13} className="text-orange-500" />
                          ) : (
                            <ArrowDown size={13} className="text-orange-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}

                {/* Row Actions column */}
                {rowActions && <th className="py-3 px-4 w-16 text-right font-bold text-zinc-500 dark:text-zinc-400">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const isSelected = selectedIds.includes(String(row.id));
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors last:border-0 dark:border-zinc-800/60 dark:hover:bg-zinc-900/30 ${
                      isSelected ? 'bg-orange-50/20 dark:bg-orange-950/10' : ''
                    }`}
                  >
                    {/* Row Select Checkbox */}
                    {onSelectionChange && (
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(String(row.id), e.target.checked)}
                          className="accent-orange-600 rounded"
                        />
                      </td>
                    )}

                    {/* Cells */}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="py-3.5 px-4 text-zinc-700 dark:text-zinc-300">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}

                    {/* Row Actions Trigger */}
                    {rowActions && <td className="py-3.5 px-4 text-right">{rowActions(row)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination component */}
      {!loading && data.length > 0 && <AppPagination totalItems={totalItems} />}
    </div>
  );
}

export default AppDataTable;
