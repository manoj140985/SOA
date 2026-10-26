import React from 'react';

export type BadgeVariant =
  | 'available'
  | 'near-limit'
  | 'exhausted'
  | 'complete'
  | 'partial'
  | 'failed'
  | 'up'
  | 'down'
  | 'neutral'
  | 'demo';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const normalized = (typeof variant === 'string' ? variant.toLowerCase().replace(/\s+/g, '-') : variant) as BadgeVariant;

  const variantStyles: Record<string, string> = {
    available: 'text-emerald-700 bg-emerald-50/80 border-emerald-200',
    'near-limit': 'text-amber-800 bg-amber-50/80 border-amber-200',
    exhausted: 'text-rose-700 bg-rose-50/80 border-rose-200',
    complete: 'text-emerald-700 bg-emerald-50/80 border-emerald-200',
    partial: 'text-amber-800 bg-amber-50/80 border-amber-200',
    failed: 'text-rose-700 bg-rose-50/80 border-rose-200',
    up: 'text-emerald-700 bg-emerald-50/80 border-emerald-200',
    down: 'text-rose-700 bg-rose-50/80 border-rose-200',
    demo: 'text-blue-700 bg-blue-50/80 border-blue-200',
    neutral: 'text-slate-600 bg-slate-50 border-slate-200',
  };

  const currentStyle = variantStyles[normalized] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${currentStyle} whitespace-nowrap shrink-0 ${className}`}
    >
      {children}
    </span>
  );
};
