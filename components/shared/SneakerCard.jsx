import React from 'react';
import { Link } from 'react-router-dom';
import PriceChange from './PriceChange';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SneakerCard({ sneaker, variant = 'default' }) {
  const isCompact = variant === 'compact';
  const change = sneaker.price_change_24h || 0;
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <Link
      to={`/sneaker/${sneaker.id}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-card border transition-all duration-300",
        isUp ? "border-green-500/30 hover:border-green-500/50" : isDown ? "border-red-500/30 hover:border-red-500/50" : "border-border/50 hover:border-primary/30",
        isCompact ? "py-2.5" : "py-3"
      )}
    >
      {/* Indicatore verde/rosso a sinistra */}
      <div className={cn(
        "w-1 self-stretch rounded-full flex-shrink-0",
        isUp ? "bg-green-500" : isDown ? "bg-red-500" : "bg-muted"
      )} />

      <div className="w-14 h-14 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
        {sneaker.image_url ? (
          <img src={sneaker.image_url} alt={sneaker.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">👟</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{sneaker.brand}</p>
        <p className="text-sm font-semibold truncate">{sneaker.name}</p>
        <div className={cn(
          "inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full",
          isUp ? "bg-green-500/15 text-green-400" : isDown ? "bg-red-500/15 text-red-400" : "bg-muted text-muted-foreground"
        )}>
          {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : isDown ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
          {isUp ? '+' : ''}{change.toFixed(1)}% 24h
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-sm font-bold font-mono", isUp ? "text-green-400" : isDown ? "text-red-400" : "text-foreground")}>
          €{sneaker.current_price?.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}