'use client';

import React, { type ComponentType } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  register?: UseFormRegisterReturn;
  error?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
}

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, register, error, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            />
          )}
          <input
            ref={ref}
            {...register}
            {...props}
            className={`w-full rounded-lg border border-zinc-200 bg-white py-2 px-3.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 ${
              Icon ? 'pl-9' : ''
            } ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          />
        </div>
        {error && (
          <span className="text-[11px] text-red-500 font-medium">{error}</span>
        )}
      </div>
    );
  }
);

AppInput.displayName = 'AppInput';
export default AppInput;
