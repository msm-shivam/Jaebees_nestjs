'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { use } from 'react';
import { Package } from 'lucide-react';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import AppDrawer from '@/components/modal/AppDrawer';
import AppInput from '@/components/form/AppInput';
import AppTextarea from '@/components/form/AppTextarea';
import AppSelect from '@/components/form/AppSelect';
import { Category } from '@/types/catalog';
import PermissionGuard from '@/components/layout/PermissionGuard';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import PageHeader from '@/components/layout/PageHeader';
import SearchInput from '@/components/shared/SearchInput';
import { useRouter } from 'next/navigation';
import { INITIAL_CATEGORIES } from '@/services/mockData';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; 
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const page = parseInt((resolvedSearchParams.page as string) || '1', 10);
  const limit = parseInt((resolvedSearchParams.limit as string) || '10', 10);
  const search = (resolvedSearchParams.search as string) || '';
  const status = (resolvedSearchParams.status as string) || '';

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '', status: 'active' },
  });

  const filteredCategories = categories.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesStatus;
  });

  const paginatedCategories = filteredCategories.slice((page - 1) * limit, page * limit);

  const router = useRouter();

const updateUrl = (newParams: Record<string, string | number | null>) => {
  const url = new URL(window.location.href);
  Object.entries(newParams).forEach(([k, v]) => {
    if (v === null || v === '') url.searchParams.delete(k);
    else url.searchParams.set(k, String(v));
  });
  router.push(url.toString());
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

  const handleOpenAddDrawer = () => {
    setEditingCategory(null);
    reset({ name: '', slug: '', description: '', status: 'active' });
    setDrawerOpen(true);
  };

  const handleOpenEditDrawer = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status,
    });
    setDrawerOpen(true);
  };

  const handleSave = (values: CategoryFormValues) => {
    if (editingCategory) {
      setCategories(
        categories.map((c) => (c.id === editingCategory.id ? { ...c, ...values, description: values.description || '' } : c))
      );
    } else {
      setCategories([
        {
          id: crypto.randomUUID(),
          ...values,
          description: values.description || '',
        },
        ...categories,
      ]);
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'description', label: 'Description' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <PermissionGuard permission="catalog.read" fallback={null}>
      <div className="space-y-6">
        <PageHeader title="Categories" description="Group your products by sports and utility types.">
          <button
            onClick={handleOpenAddDrawer}
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
          >
            <Package size={16} />
            <span>Add Category</span>
          </button>
        </PageHeader>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
          <SearchInput value={search} onChange={handleSearchChange} placeholder="Search name or slug..." />
          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <AppDataTable
          data={paginatedCategories}
          columns={columns}
          totalItems={filteredCategories.length}
          rowActions={(row: any) => (
            <AppRowActions
              onEdit={() => handleOpenEditDrawer(row)}
              onDelete={() => handleDelete(row.id)}
            />
          )}
        />

        <AppDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
        >
          <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            <AppInput label="Category Name" register={register('name')} error={errors.name?.message} />
            <AppInput label="Slug" register={register('slug')} error={errors.slug?.message} />
            <AppTextarea label="Description" register={register('description')} error={errors.description?.message} />
            <AppSelect
              label="Status"
              options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
              register={register('status')}
              error={errors.status?.message}
            />

            <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-500 transition-colors"
              >
                Save Category
              </button>
            </div>
          </form>
        </AppDrawer>
      </div>
    </PermissionGuard>
  );
}
