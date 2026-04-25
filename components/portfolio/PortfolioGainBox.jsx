import React from 'react';
import { TrendingUp, TrendingDown, Trophy, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PortfolioGainBox({ items }) {
  if (!items || items.length === 0) return null;

  const totalInvested = items.reduce((sum, i) => sum + (i.purchase_price || 0), 0);
  const totalValue = items.reduce((sum, i) => sum + (i.current_value || i.purchase_price || 0), 0);
  const totalGain = totalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const isPositive = totalGain >= 0;

  // Best and worst item
  const itemsWithRoi = items.map(i => ({
    ...i,
    roi: i.purchase_price > 0
      ? ((( i.current_value || i.purchase_price) - i.purchase_price) / i.purchase_price) * 100
      : 0,
  }));
  const best = [...itemsWithRoi].sort((a, b) => b.roi - a.roi)[0];
  const worst = [...itemsWithRoi].sort((a, b) => a.roi - b.roi)[0];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-5",
      isPositive
        ? "bg-gradient-to-br from-green-500/10 via-card to-card border-green-500/25"
        : "bg-gradient-to-br from-red-500/10 via-card to-card border-red-500/25"
    )}>
      {/* Glow blob */}
      <div className={cn(
        "absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2",
        isPositive ? "bg-green-400" : "bg-red-400"
      )} />

      <div className="relative z-10 space-y-4">
        {/* Main gain */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
            Guadagno Totale
          </p>
          <div className="flex items-end gap-3">
            <p className={cn(
              "text-4xl font-bold font-mono tracking-tight",
              isPositive ? "text-green-400" : "text-red-400"
            )}>
              {isPositive ? '+' : ''}€{totalGain.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold mb-1",
              isPositive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
            )}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            rispetto all'investimento di <span className="font-mono font-semibold text-foreground">€{totalInvested.toLocaleString('it-IT')}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* Best / Worst */}
        <div className="grid grid-cols-2 gap-3">
          {best && (
            <div className="bg-green-500/8 border border-green-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Trophy className="w-3.5 h-3.5 text-green-400" />
                <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Migliore</p>
              </div>
              <p className="text-xs font-semibold truncate">{best.sneaker_name}</p>
              <p className="text-sm font-bold font-mono text-green-400 mt-0.5">
                {best.roi >= 0 ? '+' : ''}{best.roi.toFixed(1)}%
              </p>
            </div>
          )}
          {worst && worst.id !== best?.id && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Peggiore</p>
              </div>
              <p className="text-xs font-semibold truncate">{worst.sneaker_name}</p>
              <p className="text-sm font-bold font-mono text-red-400 mt-0.5">
                {worst.roi >= 0 ? '+' : ''}{worst.roi.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}