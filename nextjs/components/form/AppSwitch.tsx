'use client';

import React from 'react';
import { Control, Controller } from 'react-hook-form';

interface AppSwitchProps {
  label: string;
  name: string;
  control: Control<Record<string, unknown>>;
  description?: string;
}

export function AppSwitch({ label, name, control, description }: AppSwitchProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col space-y-0.5">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {label}
            </span>
            {description && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {description}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              value ? 'bg-orange-600' : 'bg-zinc-200 dark:bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                value ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}
    />
  );
}

export default AppSwitch;
