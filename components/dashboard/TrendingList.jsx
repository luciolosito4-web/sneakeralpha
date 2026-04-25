import React from 'react';
import SneakerCard from '../shared/SneakerCard';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrendingList({ sneakers }) {
  const trending = [...sneakers]
    .sort((a, b) => (b.price_change_24h || 0) - (a.price_change_24h || 0))
    .slice(0, 5);

  if (trending.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Trending</h3>
        </div>
        <Link to="/explore" className="text-xs text-primary font-medium">Vedi tutto →</Link>
      </div>
      <div className="space-y-2">
        {trending.map(sneaker => (
          <SneakerCard key={sneaker.id} sneaker={sneaker} variant="compact" />
        ))}
      </div>
    </div>
  );
}