import React from 'react';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-orange-500 dark:border-zinc-800"></div>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Loading data...</p>
    </div>
  );
}

export default LoadingState;
