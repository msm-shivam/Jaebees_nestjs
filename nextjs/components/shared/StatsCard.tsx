'use client';

import React, { type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<{ size?: number; className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{title}</span>
        <div className="rounded-lg bg-zinc-100 p-2 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          {value}
        </h3>
        {trend && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 font-bold ${
                trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend.value}%
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">{trend.label || 'vs last month'}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default StatsCard;
