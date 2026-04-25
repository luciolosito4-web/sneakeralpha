import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  trending: { emoji: '🔥', label: 'Molto cercata', color: 'text-orange-400' },
  rising: { emoji: '📈', label: 'In crescita', color: 'text-gain' },
  stable: { emoji: '📊', label: 'Stabile', color: 'text-blue-400' },
  declining: { emoji: '📉', label: 'In calo', color: 'text-loss' },
};

export default function HotSneakersToday({ sneakers }) {
  const hot = sneakers
    .filter(s => (s.price_change_7d || 0) > 0 || s.category === 'trending' || s.category === 'rising')
    .sort((a, b) => (b.price_change_7d || 0) - (a.price_change_7d || 0))
    .slice(0, 5);

  if (hot.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-orange-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Hot Sneakers Oggi</h3>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {hot.map((sneaker, i) => {
          const status = statusConfig[sneaker.category] || (
            (sneaker.price_change_7d || 0) > 8
              ? statusConfig.trending
              : statusConfig.rising
          );
          const change7d = sneaker.price_change_7d;

          return (
            <Link
              key={sneaker.id}
              to={`/sneaker/${sneaker.id}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all"
            >
              {/* Rank dot */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                i === 0 ? "bg-orange-400/20 text-orange-400" : "bg-secondary text-muted-foreground"
              )}>
                {i + 1}
              </div>

              {/* Image */}
              <div className="w-11 h-11 rounded-xl bg-secondary/50 flex-shrink-0 overflow-hidden">
                {sneaker.image_url
                  ? <img src={sneaker.image_url} alt={sneaker.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">👟</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">{sneaker.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm">{status.emoji}</span>
                  <span className={`text-[10px] font-medium ${status.color}`}>{status.label}</span>
                  {change7d && (
                    <span className={`text-[10px] font-mono ml-1 ${change7d >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {change7d >= 0 ? '+' : ''}{change7d.toFixed(1)}% settimana
                    </span>
                  )}
                </div>
              </div>

              {/* Price + indicatore */}
              <div className="text-right flex-shrink-0">
                <p className={cn(
                  "text-sm font-bold font-mono",
                  (sneaker.price_change_24h || 0) > 0 ? "text-green-400" : (sneaker.price_change_24h || 0) < 0 ? "text-red-400" : "text-foreground"
                )}>
                  €{sneaker.current_price?.toLocaleString()}
                </p>
                {sneaker.price_change_24h != null && (
                  <div className={cn(
                    "flex items-center justify-end gap-0.5 text-[10px] font-semibold mt-0.5",
                    sneaker.price_change_24h >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {sneaker.price_change_24h >= 0
                      ? <TrendingUp className="w-2.5 h-2.5" />
                      : <TrendingDown className="w-2.5 h-2.5" />}
                    {sneaker.price_change_24h >= 0 ? '+' : ''}{sneaker.price_change_24h.toFixed(1)}%
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}