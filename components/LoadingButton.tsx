// components/LoadingButton.tsx
'use client';

import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type LoadingButtonProps = {
  loading: boolean;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function LoadingButton({ loading, children, className, ...props }: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={clsx(
        'px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
