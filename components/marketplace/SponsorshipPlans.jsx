import React from 'react';
import { Zap, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  { duration: 1, price: 0.99, label: '1 giorno', popular: false },
  { duration: 3, price: 2.49, label: '3 giorni', popular: true },
  { duration: 7, price: 4.99, label: '7 giorni', popular: false },
];

export default function SponsorshipPlans({ selectedPlan, onSelectPlan }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-primary" />
        <Label className="text-xs">Sponsorizza questo annuncio</Label>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">Appare sempre in cima e raggiunge più persone</p>
      
      <div className="space-y-2">
        {PLANS.map(plan => (
          <button
            key={plan.duration}
            onClick={() => onSelectPlan(plan)}
            className={cn(
              "w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between",
              selectedPlan?.duration === plan.duration
                ? "border-primary bg-primary/10"
                : "border-border/50 bg-card hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                selectedPlan?.duration === plan.duration
                  ? "border-primary bg-primary"
                  : "border-border"
              )}>
                {selectedPlan?.duration === plan.duration && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{plan.label}</p>
                {plan.popular && (
                  <p className="text-[9px] text-primary font-semibold">Più popolare</p>
                )}
              </div>
            </div>
            <p className="text-sm font-bold text-primary">€{plan.price.toFixed(2)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Aggiunto import Label
import { Label } from '@/components/ui/label';