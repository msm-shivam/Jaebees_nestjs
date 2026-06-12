'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const data = [
  { name: 'Footwear', value: 1240, color: '#f97316' },
  { name: 'Apparel', value: 856, color: '#3b82f6' },
  { name: 'Equipment', value: 523, color: '#22c55e' },
  { name: 'Accessories', value: 412, color: '#a855f7' },
  { name: 'Nutrition', value: 298, color: '#eab308' },
];

export function InventoryChart() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Inventory by Category</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Current stock distribution</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e4e4e7',
                backgroundColor: '#fff',
                fontSize: '12px',
              }}
              formatter={(value) => `${value} units`}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-xs text-zinc-600 dark:text-zinc-400">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default InventoryChart;
