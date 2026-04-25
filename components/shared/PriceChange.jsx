import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PriceChange({ value, className, showIcon = true, size = 'sm' }) {
  if (value === null || value === undefined) return null;

  const isPositive = value > 0;
  const isZero = value === 0;

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  const iconSize = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-mono",
      sizeClasses[size],
      isZero ? "text-muted-foreground" : isPositive ? "text-gain" : "text-loss",
      className
    )}>
      {showIcon && (
        isZero ? <Minus className={iconSize[size]} /> :
        isPositive ? <TrendingUp className={iconSize[size]} /> :
        <TrendingDown className={iconSize[size]} />
      )}
      {isPositive ? '+' : ''}{value?.toFixed(1)}%
    </span>
  );
}