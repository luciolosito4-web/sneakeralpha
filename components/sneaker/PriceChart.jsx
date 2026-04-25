import React, { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';

const PERIODS = [
  { label: '7G', days: 7 },
  { label: '30G', days: 30 },
  { label: 'Tutto', days: null },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{payload[0].payload.date}</p>
      <p className="text-sm font-bold font-mono text-primary">€{payload[0].value?.toLocaleString()}</p>
    </div>
  );
};

export default function PriceChart({ priceHistory, height = 200, sneaker = null }) {
  const [period, setPeriod] = useState(7);

  // Fallback: genera dati realistici se non disponibili
  const data = priceHistory && priceHistory.length > 0 ? priceHistory : 
    (sneaker ? generateFallbackData(sneaker) : []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-card rounded-xl border border-border/50">
        <p className="text-sm text-muted-foreground">Nessun dato disponibile</p>
      </div>
    );
  }

  // Helper function per generare dati fallback
  function generateFallbackData(sneaker) {
    const history = [];
    let price = sneaker.current_price || 100;
    const today = new Date();
    const volatilityFactor = {
      low: 0.005,
      medium: 0.015,
      high: 0.035,
    }[sneaker.volatility] || 0.01;

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const trendFactor = (sneaker.price_change_30d || 0) / 100 / 30;
      const randomVariation = (Math.random() - 0.5) * volatilityFactor * price;
      price = Math.max((sneaker.current_price || 100) * 0.7, price * (1 + trendFactor) + randomVariation);
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
      });
    }
    return history;
  }

  const cutoff = period
    ? new Date(Date.now() - period * 24 * 60 * 60 * 1000)
    : null;

  const filtered = cutoff
    ? data.filter(p => new Date(p.date) >= cutoff)
    : data;

  const chartData = filtered.length > 0 ? filtered : data;

  const first = chartData[0]?.price || 0;
  const last = chartData[chartData.length - 1]?.price || 0;
  const isPositive = last >= first;
  const color = isPositive ? '#4ade80' : '#f87171';
  const diff = last - first;
  const diffPct = first > 0 ? ((diff / first) * 100).toFixed(2) : '0.00';

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Andamento Prezzo</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn("text-sm font-bold font-mono", isPositive ? "text-green-400" : "text-red-400")}>
              {isPositive ? '+' : ''}{diffPct}%
            </span>
            <span className={cn("text-xs font-mono", isPositive ? "text-green-400/70" : "text-red-400/70")}>
              {isPositive ? '+' : ''}€{diff.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex bg-secondary/60 p-0.5 rounded-lg gap-0.5">
          {PERIODS.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => setPeriod(days)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
                period === days
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: 'hsl(220, 10%, 50%)' }}
            tickFormatter={(v) => {
              if (!v) return '';
              const parts = v.split('-');
              return `${parts[2]}/${parts[1]}`;
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            hide={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: 'hsl(220, 10%, 50%)' }}
            tickFormatter={(v) => `€${v}`}
            width={45}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={first} stroke="hsl(220, 10%, 30%)" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: 'hsl(220, 18%, 7%)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Min / Max */}
      <div className="flex justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2">
        <span>Min: <span className="text-red-400 font-mono font-semibold">€{Math.min(...chartData.map(d => d.price)).toLocaleString()}</span></span>
        <span>Max: <span className="text-green-400 font-mono font-semibold">€{Math.max(...chartData.map(d => d.price)).toLocaleString()}</span></span>
      </div>
    </div>
  );
}