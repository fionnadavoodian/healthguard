import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to toggle dark mode
export function toggleDarkMode() {
  if (typeof window !== 'undefined') {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('darkMode', String(!isDark));
  }
}

// Helper function to initialize dark mode
export function initDarkMode() {
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode ? savedMode === 'true' : systemPrefersDark;
    document.documentElement.classList.toggle('dark', initialMode);
    return initialMode;
  }
  return false;
}