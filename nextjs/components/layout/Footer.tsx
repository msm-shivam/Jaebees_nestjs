import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-4 px-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} Sports E-commerce Admin. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
