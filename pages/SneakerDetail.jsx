import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PriceChange from '../components/shared/PriceChange';
import PriceChart from '../components/sneaker/PriceChart';
import AIPrediction from '../components/sneaker/AIPrediction';
import RecommendationBadge from '../components/shared/RecommendationBadge';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SneakerDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const sneakerId = window.location.pathname.split('/sneaker/')[1];
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({ purchase_price: '', size: '', purchase_date: '' });
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['my-profile', me?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: me.email }),
    enabled: !!me?.email,
  });

  const isPremium = profiles[0]?.is_premium === true;

  const { data: sneakers = [], isLoading } = useQuery({
    queryKey: ['sneaker-detail', sneakerId],
    queryFn: () => base44.entities.Sneaker.filter({ id: sneakerId }),
    enabled: !!sneakerId,
  });

  const sneaker = sneakers[0];

  const addToPortfolio = useMutation({
    mutationFn: (data) => base44.entities.PortfolioItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setShowAddDialog(false);
      setFormData({ purchase_price: '', size: '', purchase_date: '' });
      toast.success('Aggiunta al portfolio!');
    },
  });

  const handleAdd = () => {
    addToPortfolio.mutate({
      sneaker_id: sneaker.id,
      sneaker_name: sneaker.name,
      sneaker_image: sneaker.image_url,
      brand: sneaker.brand,
      size: formData.size,
      purchase_price: parseFloat(formData.purchase_price) || 0,
      purchase_date: formData.purchase_date || undefined,
      current_value: sneaker.current_price,
      condition: 'deadstock',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!sneaker) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-muted-foreground">Sneaker non trovata</p>
        <Link to="/explore" className="text-primary text-sm mt-2 inline-block">← Torna a Esplora</Link>
      </div>
    );
  }

  const volatilityColors = {
    low: 'bg-gain/15 text-gain',
    medium: 'bg-yellow-500/15 text-yellow-400',
    high: 'bg-loss/15 text-loss',
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut', delay },
  });

  return (
    <div className="pb-16 space-y-12">
      {/* Back */}
      <div className="px-6 pt-6">
        <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
          <ArrowLeft className="w-4 h-4" />
          Indietro
        </Link>
      </div>

      {/* Hero image — full-width with smooth fade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-6 rounded-3xl overflow-hidden bg-gradient-to-br from-secondary via-secondary to-secondary/40 flex items-center justify-center shadow-lg"
        style={{ minHeight: 300 }}
      >
        {sneaker.image_url ? (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            src={sneaker.image_url}
            alt={sneaker.name}
            className="w-full h-80 object-contain drop-shadow-2xl"
          />
        ) : (
          <div className="text-7xl py-16">👟</div>
        )}
        {/* glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-3xl pointer-events-none" />
      </motion.div>

      {/* Brand / Name / Meta */}
      <motion.div {...fadeUp(0.12)} className="px-6 text-center space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold letter-spacing">{sneaker.brand}</p>
        <h1 className="text-3xl font-bold leading-snug">{sneaker.name}</h1>
        <div className="flex flex-col items-center gap-2">
          {sneaker.colorway && <p className="text-sm text-muted-foreground">{sneaker.colorway}</p>}
          {sneaker.sku && <p className="text-xs text-muted-foreground/60 font-mono">{sneaker.sku}</p>}
        </div>
      </motion.div>

      {/* Price card */}
      <motion.div {...fadeUp(0.16)} className="px-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-8 text-center space-y-4">
          <p className="text-5xl font-bold font-mono tracking-tight">€{sneaker.current_price?.toLocaleString()}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <PriceChange value={sneaker.price_change_24h} size="md" />
            {sneaker.retail_price && (
              <span className="text-sm text-muted-foreground">
                Retail: €{sneaker.retail_price?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div {...fadeUp(0.2)} className="px-6 flex justify-center gap-3 flex-wrap">
        {sneaker.volatility && (
          <Badge className={`${volatilityColors[sneaker.volatility]} px-4 py-2`}>
            Volatilità {sneaker.volatility === 'low' ? 'bassa' : sneaker.volatility === 'medium' ? 'media' : 'alta'}
          </Badge>
        )}
        {sneaker.ai_prediction?.recommendation && (
          <RecommendationBadge recommendation={sneaker.ai_prediction.recommendation} />
        )}
      </motion.div>

      {/* Stats grid */}
      <motion.div {...fadeUp(0.24)} className="px-6 grid grid-cols-3 gap-4">
        {[
          { label: '24h', value: sneaker.price_change_24h },
          { label: '7 giorni', value: sneaker.price_change_7d },
          { label: '30 giorni', value: sneaker.price_change_30d },
        ].map(({ label, value }) => (
          <motion.div key={label} whileHover={{ translateY: -4 }} className="bg-card rounded-2xl border border-border/50 p-5 text-center hover:border-primary/30 transition-all duration-300">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">{label}</p>
            <PriceChange value={value} size="sm" showIcon={false} />
          </motion.div>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div {...fadeUp(0.28)} className="px-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Storico Prezzi</h3>
        <PriceChart priceHistory={sneaker.price_history} sneaker={sneaker} />
      </motion.div>

      {/* AI Prediction */}
      <motion.div {...fadeUp(0.32)} className="px-6">
        <AIPrediction prediction={sneaker.ai_prediction} currentPrice={sneaker.current_price} isPremium={isPremium} />
      </motion.div>

      {/* CTA Button */}
      <motion.div {...fadeUp(0.36)} className="px-6">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full h-14 text-base font-semibold gap-2 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300" size="lg">
                <Plus className="w-5 h-5" />
                Aggiungi al Portfolio
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-card border-border rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Aggiungi al Portfolio</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-4">
              <div>
                <Label className="text-xs font-semibold">Prezzo di acquisto (€)</Label>
                <Input
                  type="number"
                  placeholder="250"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  className="bg-secondary border-border/50 mt-2 h-11 rounded-lg"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Taglia (EU)</Label>
                <Input
                  placeholder="42"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="bg-secondary border-border/50 mt-2 h-11 rounded-lg"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Data di acquisto</Label>
                <Input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="bg-secondary border-border/50 mt-2 h-11 rounded-lg"
                />
              </div>
              <Button onClick={handleAdd} className="w-full h-12 rounded-lg" disabled={!formData.purchase_price || addToPortfolio.isPending}>
                {addToPortfolio.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Conferma'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}