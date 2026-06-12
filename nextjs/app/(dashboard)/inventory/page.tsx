'use client';

import React, { useState, useTransition, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageHeader from '@/components/layout/PageHeader';
import AppDataTable from '@/components/table/AppDataTable';
import AppDrawer from '@/components/modal/AppDrawer';
import AppInput from '@/components/form/AppInput';
import AppSelect from '@/components/form/AppSelect';
import SearchInput from '@/components/shared/SearchInput';
import StatusBadge from '@/components/shared/StatusBadge';
import AppRowActions from '@/components/table/AppRowActions';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_PURCHASE_ORDERS, Product, Supplier, PurchaseOrder } from '@/services/mockData';
import StatsCard from '@/components/shared/StatsCard';
import { Plus, Warehouse, Truck, FileText, Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';

export default function InventoryPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = use(searchParamsPromise);
  const search = (resolvedSearchParams.search as string) || '';
  const [activeTab, setActiveTab] = useState<'stock' | 'suppliers' | 'orders'>('stock');
  const [, startTransition] = useTransition();

  // Mock states
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [pos] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);

  // Drawer configs
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);

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

  // Supplier Form Schema
  const supplierSchema = z.object({
    name: z.string().min(1, 'Supplier name is required'),
    contact: z.string().min(1, 'Contact person is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    status: z.enum(['active', 'inactive']),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', contact: '', email: '', phone: '', status: 'active' },
  });

  const handleOpenAddDrawer = () => {
    setEditingItem(null);
    reset({ name: '', contact: '', email: '', phone: '', status: 'active' });
    setDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item: any) => {
    setEditingItem(item);
    reset({
      name: item.name,
      contact: item.contact,
      email: item.email,
      phone: item.phone,
      status: item.status,
    });
    setDrawerOpen(true);
  };

  const handleSaveSupplier = (values: z.infer<typeof supplierSchema>) => {
    if (editingItem) {
      setSuppliers(suppliers.map((s) => (s.id === editingItem.id ? { ...s, ...values } : s)));
    } else {
      setSuppliers([{ id: crypto.randomUUID(), ...values }, ...suppliers]);
    }
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Manage stock levels, suppliers, and purchase orders.">
        {activeTab === 'suppliers' && (
          <button
            onClick={handleOpenAddDrawer}
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
        )}
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total Stock Items" value={products.length} icon={Package} />
        <StatsCard title="Active Suppliers" value={suppliers.filter(s => s.status === 'active').length} icon={Users} trend={{ value: 12.5, isPositive: true, label: 'vs last month' }} />
        <StatsCard title="Purchase Orders" value={pos.length} icon={ShoppingCart} />
        <StatsCard title="Low Stock Items" value={products.filter(p => p.stock < 15 && p.stock > 0).length} icon={AlertTriangle} trend={{ value: 8, isPositive: false, label: 'need restock' }} />
      </div>

      {/* Summary & Quick Links */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Inventory Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Total Products</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{products.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Active Suppliers</span><span className="font-bold text-green-600">{suppliers.filter(s => s.status === 'active').length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Purchase Orders</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{pos.length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Out of Stock</span><span className="font-bold text-red-500">{products.filter(p => p.stock === 0).length}</span></div>
            <div className="flex items-center justify-between text-sm"><span className="text-zinc-500">Low Stock ({'<'}15)</span><span className="font-bold text-amber-500">{products.filter(p => p.stock < 15 && p.stock > 0).length}</span></div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/inventory/stock" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Stock Levels</a>
            <a href="/inventory/suppliers" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Suppliers</a>
            <a href="/inventory/purchase-orders" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Purchase Orders</a>
            <a href="/inventory/goods-receipts" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Goods Receipts</a>
            <a href="/inventory/stock-adjustments" className="rounded-lg bg-zinc-100 p-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-orange-100 hover:text-orange-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-orange-900/30 dark:hover:text-orange-400">Stock Adjustments</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 text-sm">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 pb-3 font-semibold border-b-2 transition-all ${
            activeTab === 'stock'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Warehouse size={16} />
          <span>Stock Levels</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 pb-3 font-semibold border-b-2 transition-all ${
            activeTab === 'suppliers'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Truck size={16} />
          <span>Suppliers</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 font-semibold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <FileText size={16} />
          <span>Purchase Orders</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder={
            activeTab === 'stock'
              ? 'Search SKU or product...'
              : activeTab === 'suppliers'
              ? 'Search supplier name...'
              : 'Search PO number...'
          }
        />
      </div>

      {/* Tables depending on tab selection */}
      {activeTab === 'stock' && (
        <AppDataTable
          data={products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))}
          totalItems={products.length}
          columns={[
            { key: 'name', label: 'Product Name', sortable: true },
            { key: 'sku', label: 'SKU', sortable: true },
            {
              key: 'stock',
              label: 'Stock Count',
              sortable: true,
              render: (val: any) => (
                <span className={val === 0 ? 'text-rose-500 font-bold' : val < 15 ? 'text-amber-500 font-bold' : 'text-zinc-700 dark:text-zinc-300'}>
                  {val} {val === 0 ? '(Out of Stock)' : val < 15 ? '(Low)' : ''}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: (val: any) => <StatusBadge status={val} />,
            },
          ]}
        />
      )}

      {activeTab === 'suppliers' && (
        <AppDataTable
          data={suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))}
          totalItems={suppliers.length}
          columns={[
            { key: 'name', label: 'Supplier Name', sortable: true },
            { key: 'contact', label: 'Contact Person', sortable: true },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: (val: any) => <StatusBadge status={val} />,
            },
          ]}
          rowActions={(row: any) => (
            <AppRowActions
              onEdit={() => handleOpenEditDrawer(row)}
              onDelete={() => setSuppliers(suppliers.filter((s) => s.id !== row.id))}
            />
          )}
        />
      )}

      {activeTab === 'orders' && (
        <AppDataTable
          data={pos.filter((po) => po.poNumber.toLowerCase().includes(search.toLowerCase()))}
          totalItems={pos.length}
          columns={[
            { key: 'poNumber', label: 'PO Number', sortable: true },
            { key: 'supplier', label: 'Supplier', sortable: true },
            { key: 'orderDate', label: 'Order Date', sortable: true },
            {
              key: 'totalAmount',
              label: 'Total Amount',
              sortable: true,
              render: (val: any) => `$${Number(val).toLocaleString()}`,
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: (val: any) => <StatusBadge status={val} />,
            },
          ]}
        />
      )}

      {/* Supplier Drawer */}
      <AppDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Supplier' : 'Add Supplier'}
      >
        <form onSubmit={handleSubmit(handleSaveSupplier)} className="space-y-4">
          <AppInput label="Supplier Name" register={register('name')} error={errors.name?.message} />
          <AppInput label="Contact Person" register={register('contact')} error={errors.contact?.message} />
          <AppInput label="Email" type="email" register={register('email')} error={errors.email?.message} />
          <AppInput label="Phone" register={register('phone')} error={errors.phone?.message} />
          <AppSelect
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
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
              Save Supplier
            </button>
          </div>
        </form>
      </AppDrawer>
    </div>
  );
}
