'use client';

import React, { useState, useTransition, use, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable, { TableColumn } from '@/components/table/AppDataTable';
import AppDrawer from '@/components/modal/AppDrawer';
import AppInput from '@/components/form/AppInput';
import AppSelect from '@/components/form/AppSelect';
import AppImageUploader from '@/components/form/AppImageUploader';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import StatsCard from '@/components/shared/StatsCard';
import AppRowActions from '@/components/table/AppRowActions';
import AppBulkActions from '@/components/table/AppBulkActions';
import { Product } from '@/types/catalog';
import { Package, CheckCircle, FileText, AlertTriangle, Plus, RotateCcw } from 'lucide-react';
import PermissionGuard from '@/components/layout/PermissionGuard';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS } from '@/services/mockData';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  status: z.enum(['active', 'inactive', 'out of stock']),
  image: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const page = parseInt((resolvedSearchParams.page as string) || '1', 10);
  const limit = parseInt((resolvedSearchParams.limit as string) || '10', 10);
  const search = (resolvedSearchParams.search as string) || '';
  const status = (resolvedSearchParams.status as string) || '';
  const categoryFilter = (resolvedSearchParams.category as string) || '';
  const brandFilter = (resolvedSearchParams.brand as string) || '';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      sku: '',
      category: 'Running',
      brand: 'Nike',
      price: 0,
      stock: 0,
      status: 'active',
      image: '',
    },
  });

  const productImage = watch('image');

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const draftProducts = products.filter((p) => p.status === 'inactive').length;
  const outOfStockProducts = products.filter((p) => p.status === 'out of stock' || p.stock === 0).length;

  const statsCards = useMemo(
    () => [
      { title: 'Total Products', value: totalProducts, icon: Package },
      { title: 'Active Products', value: activeProducts, icon: CheckCircle, trend: { value: 12, isPositive: true } },
      { title: 'Draft Products', value: draftProducts, icon: FileText },
      { title: 'Out Of Stock', value: outOfStockProducts, icon: AlertTriangle, trend: { value: 8, isPositive: false } },
    ],
    [totalProducts, activeProducts, draftProducts, outOfStockProducts]
  );

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || item.status === status;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesBrand = !brandFilter || item.brand === brandFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesBrand;
  });

  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    const valA = (a as unknown as Record<string, unknown>)[sortKey];
    const valB = (b as unknown as Record<string, unknown>)[sortKey];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    return sortDir === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const paginatedProducts = sortedProducts.slice((page - 1) * limit, page * limit);

  // Sync state helpers
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

  const handleCategoryFilter = (val: string) => {
    startTransition(() => {
      updateUrl({ category: val, page: 1 });
    });
  };

  const handleBrandFilter = (val: string) => {
    startTransition(() => {
      updateUrl({ brand: val, page: 1 });
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      updateUrl({ search: '', status: '', category: '', brand: '', page: 1 });
    });
  };

  const handleOpenAddDrawer = () => {
    setEditingProduct(null);
    reset({
      name: '',
      sku: '',
      category: 'Running',
      brand: 'Nike',
      price: 0,
      stock: 0,
      status: 'active',
      image: '',
    });
    setDrawerOpen(true);
  };

  const handleOpenEditDrawer = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      status: product.status,
      image: product.image,
    });
    setDrawerOpen(true);
  };

  const handleSave = (values: ProductFormValues) => {
    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? { ...p, ...values } : p))
      );
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        ...values,
      };
      setProducts([newProduct, ...products]);
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleBulkDelete = () => {
    setProducts(products.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const handleSort = (key: string, dir: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDir(dir);
  };

  // Columns definition
  const columns: TableColumn[] = [
    {
      key: 'image',
      label: 'Image',
      render: (val) => (
        <img src={val} alt="Product" className="h-10 w-10 rounded-lg object-cover border border-zinc-200" />
      ),
    },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'brand', label: 'Brand', sortable: true },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (val) => `$${Number(val).toFixed(2)}`,
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (val) => (
        <span className={val === 0 ? 'text-rose-500 font-bold' : val < 10 ? 'text-amber-500 font-bold' : 'text-zinc-700 dark:text-zinc-300'}>
          {val} {val === 0 ? '(Out of Stock)' : val < 10 ? '(Low Stock)' : ''}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your sports gear and products catalog.">
        <PermissionGuard permission="product.create" fallback={null}>
          <button
            onClick={handleOpenAddDrawer}
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </PermissionGuard>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statsCards.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Bulk Action Bar */}
      <AppBulkActions selectedCount={selectedIds.length} onBulkDelete={handleBulkDelete} />

      {/* Filter Toolbar Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput value={search} onChange={handleSearchChange} placeholder="Search name or SKU..." />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out of stock">Out of Stock</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="">All Categories</option>
            {INITIAL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => handleBrandFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="">All Brands</option>
            {INITIAL_BRANDS.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <AppDataTable
        data={paginatedProducts}
        columns={columns}
        totalItems={sortedProducts.length}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onSort={handleSort}
        rowActions={(row: any) => (
          <AppRowActions
            onEdit={() => handleOpenEditDrawer(row)}
            onDelete={() => handleDelete(row.id)}
          />
        )}
      />

      {/* Creation/Edit Drawer */}
      <AppDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <AppInput label="Product Name" register={register('name')} error={errors.name?.message} />
          <AppInput label="SKU" register={register('sku')} error={errors.sku?.message} />

          <div className="grid grid-cols-2 gap-4">
            <AppSelect
              label="Category"
              options={INITIAL_CATEGORIES.map((c) => ({ value: c.name, label: c.name }))}
              register={register('category')}
              error={errors.category?.message}
            />
            <AppSelect
              label="Brand"
              options={INITIAL_BRANDS.map((b) => ({ value: b.name, label: b.name }))}
              register={register('brand')}
              error={errors.brand?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AppInput label="Price ($)" type="number" step="0.01" register={register('price')} error={errors.price?.message} />
            <AppInput label="Stock Qty" type="number" register={register('stock')} error={errors.stock?.message} />
          </div>

          <AppSelect
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'out of stock', label: 'Out of Stock' },
            ]}
            register={register('status')}
            error={errors.status?.message}
          />

          <AppImageUploader
            label="Product Image"
            value={productImage}
            onChange={(url) => setValue('image', url)}
            error={errors.image?.message}
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
              Save Product
            </button>
          </div>
        </form>
      </AppDrawer>
    </div>
  );
}
