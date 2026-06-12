'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface AppSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  register?: UseFormRegisterReturn;
  error?: string;
}

export const AppSelect = React.forwardRef<HTMLSelectElement, AppSelectProps>(
  ({ label, options, register, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <select
          ref={ref}
          {...register}
          {...props}
          className={`w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 ${
            error ? 'border-red-500 focus:border-red-500' : ''
          } ${className}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-[11px] text-red-500 font-medium">{error}</span>
        )}
      </div>
    );
  }
);

AppSelect.displayName = 'AppSelect';
export default AppSelect;
