import React, { useState, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search, Loader2, TrendingUp, TrendingDown, Flame, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import PriceChange from '../components/shared/PriceChange';

const brands = ['Tutti', 'Nike', 'Jordan', 'Adidas', 'Yeezy', 'New Balance'];

const sortOptions = [
  { label: '🔥 Trending', key: 'change_desc' },
  { label: '📈 In salita', key: 'rising' },
  { label: '💰 Prezzo ↑', key: 'price_desc' },
  { label: '💸 Prezzo ↓', key: 'price_asc' },
];

function SneakerRow({ sneaker, rank }) {
  const pl = sneaker.retail_price
    ? ((sneaker.current_price - sneaker.retail_price) / sneaker.retail_price) * 100
    : null;

  return (
    <Link
    to={`/sneaker/${sneaker.id}`}
    className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
    >
      {/* Rank */}
      <span className="text-xs font-bold font-mono text-muted-foreground w-5 text-center flex-shrink-0">
        {rank}
      </span>

      {/* Image */}
      <div className="w-14 h-14 rounded-xl bg-secondary/50 flex-shrink-0 overflow-hidden relative">
        {sneaker.image_url ? (
          <motion.img 
            src={sneaker.image_url} 
            alt={sneaker.name} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">👟</div>
        )}
        {(sneaker.price_change_24h || 0) > 3 && (
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gain shadow-[0_0_6px_hsl(152,69%,53%)]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{sneaker.brand}</p>
        <p className="text-sm font-semibold truncate leading-tight">{sneaker.name}</p>
        {pl !== null && (
          <p className={`text-[10px] font-mono mt-0.5 ${pl >= 0 ? 'text-gain' : 'text-loss'}`}>
            Profitto retail: {pl >= 0 ? '+' : ''}{pl.toFixed(0)}%
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="text-base font-bold font-mono">€{sneaker.current_price?.toLocaleString()}</p>
        <PriceChange value={sneaker.price_change_24h} size="xs" />
      </div>
    </Link>
  );
}

export default function Explore() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('Tutti');
  const [sortBy, setSortBy] = useState('change_desc');
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = async (e) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 70 && window.scrollY === 0 && !refreshing) {
      setRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['sneakers-explore'] });
      setRefreshing(false);
    }
  };

  const { data: sneakers = [], isLoading } = useQuery({
    queryKey: ['sneakers-explore'],
    queryFn: () => base44.entities.Sneaker.list('-updated_date', 300),
    refetchInterval: 5 * 60 * 1000, // ogni 5 minuti
  });

  const filtered = useMemo(() => {
    let result = sneakers.filter(s => {
      const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.brand?.toLowerCase().includes(search.toLowerCase());
      const matchBrand = brand === 'Tutti' || s.brand === brand;
      return matchSearch && matchBrand;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return (a.current_price || 0) - (b.current_price || 0);
        case 'price_desc': return (b.current_price || 0) - (a.current_price || 0);
        case 'change_desc': return (b.price_change_24h || 0) - (a.price_change_24h || 0);
        case 'rising': return (b.price_change_7d || 0) - (a.price_change_7d || 0);
        default: return 0;
      }
    });

    return result;
  }, [sneakers, search, brand, sortBy]);

  const topGainer = filtered[0];

  return (
    <div className="min-h-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {refreshing && (
        <div className="flex justify-center pt-4 -mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
      {/* Header */}
      <div className="px-4 pt-6 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Traccia Sneaker</h1>
            <p className="text-xs text-muted-foreground">Mercato in tempo reale</p>
          </div>
          <div className="flex items-center gap-1.5 bg-gain/10 border border-gain/20 px-2.5 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
            <span className="text-[10px] font-medium text-gain">LIVE</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca sneaker o brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-white/10 h-11 rounded-xl focus:border-primary/50 focus:ring-0"
          />
        </div>
      </div>

      {/* Hot Resell Banner */}
      {topGainer && !search && (
        <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-gain/10 via-gain/5 to-transparent border border-gain/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gain/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-secondary/70 overflow-hidden flex-shrink-0">
              {topGainer.image_url
                ? <img src={topGainer.image_url} alt={topGainer.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl">👟</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Hot Resell</span>
              </div>
              <p className="text-sm font-bold truncate">{topGainer.name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold font-mono text-gain">€{topGainer.current_price?.toLocaleString()}</p>
              <PriceChange value={topGainer.price_change_24h} size="xs" />
            </div>
          </div>
        </div>
      )}

      {/* Brand pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide mb-2">
        {brands.map(b => (
          <button
            key={b}
            onClick={() => setBrand(b)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
              brand === b
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(152,69%,53%,0.4)]"
                : "bg-secondary/50 text-muted-foreground border-white/10 hover:border-primary/30 hover:text-foreground"
            )}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto scrollbar-hide">
        {sortOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all",
              sortBy === opt.key
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">Nessuna sneaker trovata</p>
        </div>
      ) : (
        <div className="mx-4 mb-4 bg-card rounded-2xl border border-white/5 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/3 border-b border-white/5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest w-5">#</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex-1 ml-[68px]">Sneaker</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest text-right">Prezzo / 24h</span>
          </div>
          {filtered.map((sneaker, i) => (
            <SneakerRow key={sneaker.id} sneaker={sneaker} rank={i + 1} />
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}