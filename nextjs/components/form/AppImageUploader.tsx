'use client';

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface AppImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  error?: string;
}

export function AppImageUploader({ label, value, onChange, error }: AppImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setUploading(false);

    // Mock upload URL - using a dynamic placeholder
    const mockUrl = URL.createObjectURL(file);
    onChange(mockUrl);
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>

      {value ? (
        // Preview State
        <div className="relative group overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 h-36 flex items-center justify-center">
          <img src={value} alt="Preview" className="object-contain max-h-full max-w-full" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        // Upload Placeholder State
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-6 h-36 transition hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 ${
          error ? 'border-red-500 bg-red-50/10' : 'border-zinc-200 dark:border-zinc-800'
        }`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-orange-500"></div>
              <span className="text-xs">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
              <Upload size={24} />
              <span className="text-xs font-semibold">Click to upload image</span>
              <span className="text-[10px]">PNG, JPG, WEBP up to 2MB</span>
            </div>
          )}
        </label>
      )}
      {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
    </div>
  );
}

export default AppImageUploader;
