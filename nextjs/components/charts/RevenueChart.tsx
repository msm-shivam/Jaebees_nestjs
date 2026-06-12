'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan', revenue: 42800, target: 40000 },
  { month: 'Feb', revenue: 35600, target: 38000 },
  { month: 'Mar', revenue: 51200, target: 45000 },
  { month: 'Apr', revenue: 48500, target: 46000 },
  { month: 'May', revenue: 53900, target: 50000 },
  { month: 'Jun', revenue: 62400, target: 55000 },
];

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Revenue Overview</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Monthly revenue vs target</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
            <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e4e4e7',
                backgroundColor: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Bar dataKey="target" fill="#e4e4e7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueChart;
