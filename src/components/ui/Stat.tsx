import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface StatProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  change?: number;
  className?: string;
}

export function Stat({ icon, label, value, change, className }: StatProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && (
          <span className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-zapp-orange shrink-0">
            {icon}
          </span>
        )}
      </div>

      <span className="text-2xl font-bold text-gray-900">{value}</span>

      {change !== undefined && (
        <span
          className={clsx(
            'inline-flex items-center gap-1 text-xs font-medium',
            isPositive && 'text-green-600',
            isNegative && 'text-red-600'
          )}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? '+' : ''}
          {change.toFixed(1)}%
          <span className="text-gray-400 ml-1">vs last month</span>
        </span>
      )}
    </div>
  );
}
