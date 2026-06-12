'use client';

import React from 'react';
import PageHeader from '@/components/layout/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import StatusBadge from '@/components/shared/StatusBadge';
import RevenueChart from '@/components/charts/RevenueChart';
import OrdersChart from '@/components/charts/OrdersChart';
import InventoryChart from '@/components/charts/InventoryChart';
import InventoryOverview from '@/components/inventory/InventoryOverview';
import { DollarSign, ShoppingCart, Award, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$142,384.50',
      icon: DollarSign,
      trend: { value: 12.5, isPositive: true, label: 'vs last week' },
    },
    {
      title: 'Sales Orders',
      value: '1,284',
      icon: ShoppingCart,
      trend: { value: 8.2, isPositive: true, label: 'vs last week' },
    },
    {
      title: 'Active Products',
      value: '482',
      icon: Award,
      trend: { value: 2.1, isPositive: true, label: 'vs last month' },
    },
    {
      title: 'Total Customers',
      value: '8,492',
      icon: Users,
      trend: { value: 5.4, isPositive: true, label: 'vs last week' },
    },
  ];

  const recentOrders = [
    { id: 'ORD-8492', customer: 'Liam Neeson', item: 'Nike Air Max 270', amount: '$150.00', status: 'delivered', date: 'Just now' },
    { id: 'ORD-8491', customer: 'Scarlett J.', item: 'Adidas Ultraboost', amount: '$180.00', status: 'processing', date: '5 mins ago' },
    { id: 'ORD-8490', customer: 'Chris Evans', item: 'Puma Velocity Nitro', amount: '$120.00', status: 'pending', date: '20 mins ago' },
    { id: 'ORD-8489', customer: 'Robert Downey', item: 'Under Armour Curry 9', amount: '$160.00', status: 'cancelled', date: '1 hour ago' },
    { id: 'ORD-8488', customer: 'Tom Holland', item: 'Nike Pegasus 40', amount: '$130.00', status: 'delivered', date: '3 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time performance metrics, graphs, and inventory overview."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <InventoryOverview />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <OrdersChart />
        <InventoryChart />
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Recent Orders</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest checkout entries</p>
              </div>
              <Link
                href="/orders"
                className="flex items-center gap-0.5 text-xs font-semibold text-orange-600 hover:text-orange-500 hover:underline dark:text-orange-500"
              >
                <span>View all</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200">{order.customer}</p>
                    <p className="text-zinc-400 dark:text-zinc-500">{order.item}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">{order.amount}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
