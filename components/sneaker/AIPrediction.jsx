import React from 'react';
import RecommendationBadge from '../shared/RecommendationBadge';
import { Brain, TrendingUp, Shield, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AIPrediction({ prediction, currentPrice, isPremium }) {
  // Paywall per utenti non-premium
  if (!isPremium) {
    return (
      <div className="relative bg-card rounded-xl border border-yellow-500/30 p-5 overflow-hidden">
        {/* Blurred preview */}
        <div className="blur-sm pointer-events-none select-none space-y-3 opacity-60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Prediction</h3>
              <p className="text-[10px] text-muted-foreground">Confidenza: 87%</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['3 mesi', '6 mesi', '12 mesi'].map(l => (
              <div key={l} className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{l}</p>
                <p className="text-sm font-bold font-mono">€•••</p>
                <p className="text-[10px] font-mono text-gain">+•••%</p>
              </div>
            ))}
          </div>
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/60 backdrop-blur-[2px] rounded-xl">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-bold text-yellow-400">Funzione Premium</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sblocca le previsioni AI sui prezzi futuri</p>
          </div>
          <Link
            to="/premium"
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold px-4 py-2 rounded-full transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            Passa a Premium
          </Link>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-card rounded-xl border border-border/50 p-5 text-center">
        <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">AI Prediction non disponibile</p>
      </div>
    );
  }

  const riskColors = {
    low: 'text-gain',
    medium: 'text-yellow-400',
    high: 'text-loss',
  };

  const riskLabels = {
    low: 'Basso',
    medium: 'Medio',
    high: 'Alto',
  };

  const predictions = [
    { label: '3 mesi', value: prediction.predicted_price_3m },
    { label: '6 mesi', value: prediction.predicted_price_6m },
    { label: '12 mesi', value: prediction.predicted_price_12m },
  ].filter(p => p.value);

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Prediction</h3>
            {prediction.confidence && (
              <p className="text-[10px] text-muted-foreground">
                Confidenza: {(prediction.confidence * 100).toFixed(0)}%
              </p>
            )}
          </div>
        </div>
        <RecommendationBadge recommendation={prediction.recommendation} size="md" />
      </div>

      {/* Predicted prices */}
      {predictions.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {predictions.map(p => {
            const change = currentPrice ? ((p.value - currentPrice) / currentPrice) * 100 : 0;
            return (
              <div key={p.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{p.label}</p>
                <p className="text-sm font-bold font-mono">€{p.value?.toLocaleString()}</p>
                <p className={`text-[10px] font-mono ${change >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Growth & Risk */}
      <div className="flex gap-3">
        {prediction.growth_percent !== undefined && (
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 flex-1">
            <TrendingUp className="w-4 h-4 text-gain" />
            <div>
              <p className="text-[10px] text-muted-foreground">Crescita stimata</p>
              <p className="text-sm font-bold font-mono text-gain">+{prediction.growth_percent}%</p>
            </div>
          </div>
        )}
        {prediction.risk_level && (
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 flex-1">
            <Shield className={`w-4 h-4 ${riskColors[prediction.risk_level]}`} />
            <div>
              <p className="text-[10px] text-muted-foreground">Rischio</p>
              <p className={`text-sm font-bold ${riskColors[prediction.risk_level]}`}>
                {riskLabels[prediction.risk_level]}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}