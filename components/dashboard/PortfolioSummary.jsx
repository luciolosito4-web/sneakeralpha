import React from 'react';
import PriceChange from '../shared/PriceChange';
import { Briefcase } from 'lucide-react';

export default function PortfolioSummary({ items }) {
  const totalInvested = items.reduce((sum, i) => sum + (i.purchase_price || 0), 0);
  const totalValue = items.reduce((sum, i) => sum + (i.current_value || i.purchase_price || 0), 0);
  const totalPL = totalValue - totalInvested;
  const plPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border/50 p-5">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/3 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Il tuo Portfolio</span>
        </div>

        <p className="text-3xl font-bold font-mono tracking-tight">
          €{totalValue.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <PriceChange value={plPercent} size="md" />
          <span className="text-sm text-muted-foreground">
            {totalPL >= 0 ? '+' : ''}€{totalPL.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Investito</p>
            <p className="font-mono font-semibold">€{totalInvested.toLocaleString('it-IT')}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Paia</p>
            <p className="font-mono font-semibold">{items.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">P/L</p>
            <p className={`font-mono font-semibold ${totalPL >= 0 ? 'text-gain' : 'text-loss'}`}>
              {totalPL >= 0 ? '+' : ''}€{totalPL.toLocaleString('it-IT')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}