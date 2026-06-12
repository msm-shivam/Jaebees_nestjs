'use client';

import React from 'react';
import { Package, AlertTriangle, RefreshCw, ArrowUpRight } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import Link from 'next/link';

const lowStockItems = [
  { name: 'Nike Air Max 270', sku: 'SKU-001', stock: 4, minStock: 10 },
  { name: 'Adidas Ultraboost', sku: 'SKU-002', stock: 6, minStock: 15 },
  { name: 'Puma Velocity Nitro', sku: 'SKU-003', stock: 3, minStock: 10 },
  { name: 'Under Armour Curry 9', sku: 'SKU-004', stock: 8, minStock: 20 },
];

const recentMovements = [
  { product: 'Nike Pegasus 40', type: 'incoming', qty: 50, date: '2 hours ago' },
  { product: 'Reebok Nano X3', type: 'outgoing', qty: 12, date: '4 hours ago' },
  { product: 'Asics Gel-Kayano', type: 'incoming', qty: 30, date: '6 hours ago' },
  { product: 'New Balance 1080', type: 'outgoing', qty: 8, date: '8 hours ago' },
];

export function InventoryOverview() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Inventory Overview</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Stock levels and movements</p>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-0.5 text-xs font-semibold text-orange-600 hover:text-orange-500 hover:underline dark:text-orange-500"
        >
          <span>Manage</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-zinc-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Total Items</span>
          </div>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">3,329</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-rose-500" />
            <span className="text-xs text-rose-600 dark:text-rose-400">Low Stock</span>
          </div>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">4 items</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Low Stock Alerts</h4>
        {lowStockItems.map((item) => (
          <div key={item.sku} className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</p>
              <p className="text-xs text-zinc-400">{item.sku}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${item.stock <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {item.stock} / {item.minStock}
              </p>
              <span className="text-[10px] text-zinc-400">min stock</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Movements</h4>
        {recentMovements.map((movement, idx) => (
          <div key={idx} className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <div className="flex items-center gap-2">
              <RefreshCw size={12} className={movement.type === 'incoming' ? 'text-emerald-500' : 'text-rose-500'} />
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{movement.product}</p>
                <p className="text-xs text-zinc-400">{movement.date}</p>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={movement.type === 'incoming' ? 'completed' : 'pending'} />
              <p className="text-xs text-zinc-500 mt-0.5">{movement.type === 'incoming' ? '+' : '-'}{movement.qty} units</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InventoryOverview;
