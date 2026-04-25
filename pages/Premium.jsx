import React, { useState } from 'react';
import { Check, Zap, Bell, BarChart3, Crown, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  '1 alert per sneaker',
  'Portfolio fino a 20 paia',
  'Accesso mercato base',
  'Profilo pubblico',
];

const PREMIUM_FEATURES = [
  { icon: Bell, text: 'Alert illimitati' },
  { icon: BarChart3, text: 'Aggiornamenti prezzi più frequenti' },
  { icon: Zap, text: 'Alert prioritari (notifica istantanea)' },
  { icon: BarChart3, text: 'AI Predictions avanzate' },
  { icon: Star, text: 'Badge Premium nel profilo' },
  { icon: MapPin, text: 'Sponsorizzazione annuncio per zona' },
];

const ZONE_PRICES = [
  { city: 'Milano', price: 29, flag: '🏙️' },
  { city: 'Roma', price: 29, flag: '🏛️' },
  { city: 'Napoli', price: 19, flag: '☀️' },
  { city: 'Torino', price: 19, flag: '⚽' },
  { city: 'Città piccole', price: 9, flag: '📍' },
];

export default function Premium() {
  const [billing, setBilling] = useState('monthly');

  const handleSubscribe = () => {
    toast.info('Abbonamento Premium in arrivo! Ti avviseremo al lancio.');
  };

  return (
    <div className="px-4 pt-6 pb-10 space-y-6 min-h-screen">
      {/* Header */}
      <div className="text-center pt-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sneaker Alpha</h1>
        <p className="text-sm text-muted-foreground mt-1">Scegli il piano giusto per te</p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center">
        <div className="flex bg-secondary/50 p-1 rounded-xl gap-1">
          <button
            onClick={() => setBilling('monthly')}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
              billing === 'monthly' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Mensile
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              billing === 'yearly' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Annuale
            <span className="text-[10px] bg-gain/20 text-gain px-1.5 py-0.5 rounded-full font-bold">-33%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {/* Free Plan */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Gratis</h2>
              <p className="text-xs text-muted-foreground">Per sempre gratuito</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono">€0</p>
              <p className="text-[10px] text-muted-foreground">/mese</p>
            </div>
          </div>
          <div className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full border border-muted-foreground/40 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Plan */}
        <div className="relative bg-gradient-to-br from-yellow-500/10 via-card to-card rounded-2xl border border-yellow-500/30 p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <h2 className="text-lg font-bold text-yellow-400">Premium</h2>
                  <span className="text-[10px] bg-yellow-400/15 text-yellow-400 px-2 py-0.5 rounded-full font-bold border border-yellow-400/20">
                    POPOLARE
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Tutto illimitato</p>
              </div>
              <div className="text-right">
                {billing === 'monthly' ? (
                  <>
                    <p className="text-2xl font-bold font-mono text-yellow-400">€4,99</p>
                    <p className="text-[10px] text-muted-foreground">/mese</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold font-mono text-yellow-400">€40</p>
                    <p className="text-[10px] text-muted-foreground">/anno · €3,33/mese</p>
                    <p className="text-[10px] text-gain font-bold">Risparmi €19,88</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              {PREMIUM_FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-yellow-400/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-2.5 h-2.5 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubscribe}
              className="w-full h-11 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm shadow-[0_0_20px_hsl(48,96%,53%,0.3)]"
            >
              <Crown className="w-4 h-4 mr-2" />
              Passa a Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Sponsorizzazioni per zona */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Sponsorizzazioni per zona</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Il tuo annuncio visibile in cima agli utenti della tua città. Potente per reseller e negozi fisici.
        </p>

        <div className="space-y-2">
          {ZONE_PRICES.map(({ city, price, flag }) => (
            <div key={city} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <span>{flag}</span>
                <span className="text-sm font-medium">{city}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-primary">€{price}<span className="text-muted-foreground text-xs font-normal">/mese</span></span>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-4 h-9 text-xs border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => toast.info('Sponsorizzazioni per zona in arrivo!')}
        >
          <Zap className="w-3.5 h-3.5 mr-2" />
          Prenota il tuo spot
        </Button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground pb-2">
        Annullabile in qualsiasi momento · Pagamento sicuro
      </p>
    </div>
  );
}