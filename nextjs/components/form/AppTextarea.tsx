'use client';

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  register?: UseFormRegisterReturn;
  error?: string;
}

export const AppTextarea = React.forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ label, register, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
        <textarea
          ref={ref}
          {...register}
          {...props}
          className={`w-full rounded-lg border border-zinc-200 bg-white py-2 px-3.5 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 min-h-[80px] ${
            error ? 'border-red-500 focus:border-red-500' : ''
          } ${className}`}
        />
        {error && (
          <span className="text-[11px] text-red-500 font-medium">{error}</span>
        )}
      </div>
    );
  }
);

AppTextarea.displayName = 'AppTextarea';
export default AppTextarea;
