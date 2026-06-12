'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { day: 'Mon', orders: 45, completed: 32 },
  { day: 'Tue', orders: 52, completed: 41 },
  { day: 'Wed', orders: 38, completed: 30 },
  { day: 'Thu', orders: 61, completed: 48 },
  { day: 'Fri', orders: 55, completed: 44 },
  { day: 'Sat', orders: 42, completed: 36 },
  { day: 'Sun', orders: 33, completed: 28 },
];

export function OrdersChart() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Order Trends</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Daily orders and completion rate</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
            <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e4e4e7',
                backgroundColor: '#fff',
                fontSize: '12px',
              }}
            />
            <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default OrdersChart;
