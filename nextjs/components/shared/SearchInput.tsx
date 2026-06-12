'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceTime?: number;
}

export function SearchInput({
  value: initialValue,
  onChange,
  placeholder = 'Search...',
  debounceTime = 500,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (value === initialValue) return;
    const handler = setTimeout(() => {
      onChange(value);
    }, debounceTime);
    return () => clearTimeout(handler);
  }, [value, initialValue, onChange, debounceTime]);

  return (
    <div className="relative flex-1 max-w-md">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-8 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
