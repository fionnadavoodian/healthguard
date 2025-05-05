// app/providers/index.tsx
'use client';

import { NextAuthProvider } from './NextAuthProvider';
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NextAuthProvider>
        {children}
      </NextAuthProvider>
    </ThemeProvider>
  );
}