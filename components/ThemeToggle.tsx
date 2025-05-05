// components/ThemeToggle.tsx
'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { MoonIcon, SunIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Current theme: ${theme}`}
    >
      {theme === 'light' && <SunIcon className="h-5 w-5 text-yellow-500" />}
      {theme === 'dark' && <MoonIcon className="h-5 w-5 text-blue-400" />}
      {theme === 'system' && <ComputerDesktopIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
    </button>
  );
}