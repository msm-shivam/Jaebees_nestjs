"use client";

import React, { Suspense, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import AppDrawer from '@/components/modal/AppDrawer';
import AppInput from '@/components/form/AppInput';
import AppSelect from '@/components/form/AppSelect';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { Brand } from '@/types/catalog';
import { Plus } from 'lucide-react';
import { INITIAL_BRANDS } from '@/services/mockData';

const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required'),
  code: z.string().min(1, 'Brand code is required'),
  status: z.enum(['active', 'inactive']),
});

type BrandFormValues = z.infer<typeof brandSchema>;

function BrandsPageContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', code: '', status: 'active' },
  });

  const updateUrl = (newParams: Record<string, string | number | null>) => {
    const url = new URL(window.location.href);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') url.searchParams.delete(k);
      else url.searchParams.set(k, String(v));
    });
    window.history.pushState({}, '', url.toString());
  };

  const handleSearchChange = (val: string) => {
    startTransition(() => updateUrl({ search: val, page: 1 }));
  };

  const handleStatusFilter = (val: string) => {
    startTransition(() => updateUrl({ status: val, page: 1 }));
  };

  const handleOpenAddDrawer = () => {
    setEditingBrand(null);
    reset({ name: '', code: '', status: 'active' });
    setDrawerOpen(true);
  };

  const handleOpenEditDrawer = (brand: Brand) => {
    setEditingBrand(brand);
    reset({ name: brand.name, code: brand.code, status: brand.status });
    setDrawerOpen(true);
  };

  const handleSave = (values: BrandFormValues) => {
    if (editingBrand) {
      setBrands(brands.map(b => (b.id === editingBrand.id ? { ...b, ...values } : b)));
    } else {
      setBrands([
        { id: crypto.randomUUID(), ...values },
        ...brands,
      ]);
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setBrands(brands.filter(b => b.id !== id));
  };

  const filteredBrands = brands.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesStatus;
  });

  const paginatedBrands = filteredBrands.slice((page - 1) * limit, page * limit);

  const columns: TableColumn[] = [
    { key: 'name', label: 'Brand Name', sortable: true },
    { key: 'code', label: 'Brand Code', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Brands" description="Manage brand profiles, partnership codes, and states.">
        <button
          onClick={handleOpenAddDrawer}
          className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
        >
          <Plus size={16} />
          <span>Add Brand</span>
        </button>
      </PageHeader>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search name or code..." />
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
        data={paginatedBrands}
        columns={columns}
        totalItems={filteredBrands.length}
        rowActions={(row: any) => (
          <AppRowActions
            onEdit={() => handleOpenEditDrawer(row)}
            onDelete={() => handleDelete(row.id)}
          />
        )}
      />

      <AppDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingBrand ? 'Edit Brand' : 'Add New Brand'}>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <AppInput label="Brand Name" register={register('name')} error={errors.name?.message} />
          <AppInput label="Brand Code" register={register('code')} error={errors.code?.message} />
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
              Save Brand
            </button>
          </div>
        </form>
      </AppDrawer>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense>
      <BrandsPageContent />
    </Suspense>
  );
}
