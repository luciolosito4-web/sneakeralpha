import React from 'react';
import { cn } from '@/lib/utils';

const config = {
  buy: { label: 'BUY', bg: 'bg-gain/15', text: 'text-gain', border: 'border-gain/30' },
  hold: { label: 'HOLD', bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  sell: { label: 'SELL', bg: 'bg-loss/15', text: 'text-loss', border: 'border-loss/30' },
};

export default function RecommendationBadge({ recommendation, size = 'sm' }) {
  if (!recommendation) return null;
  const c = config[recommendation] || config.hold;

  return (
    <span className={cn(
      "inline-flex items-center font-bold tracking-widest border rounded-full",
      c.bg, c.text, c.border,
      size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1'
    )}>
      {c.label}
    </span>
  );
}