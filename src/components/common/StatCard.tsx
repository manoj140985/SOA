import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
}) => {
  const borderColors = {
    default: 'border-slate-200',
    warning: 'border-amber-200',
    danger: 'border-rose-200',
    success: 'border-emerald-200',
  };

  const textColors = {
    default: 'text-slate-900',
    warning: 'text-amber-800',
    danger: 'text-rose-750',
    success: 'text-emerald-800',
  };

  return (
    <div className={`bg-white rounded-lg border ${borderColors[variant]} p-5 shadow-xs transition-shadow hover:shadow-sm`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {Icon && (
          <div className="p-2 rounded-md bg-slate-50 text-slate-600">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${textColors[variant]}`}>
          {value}
        </span>
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
};
