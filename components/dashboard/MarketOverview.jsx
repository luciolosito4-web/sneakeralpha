import React from 'react';
import { BarChart3, Activity, Zap } from 'lucide-react';

export default function MarketOverview({ sneakers }) {
  const avgChange = sneakers.length > 0
    ? sneakers.reduce((sum, s) => sum + (s.price_change_24h || 0), 0) / sneakers.length
    : 0;

  const rising = sneakers.filter(s => (s.price_change_24h || 0) > 0).length;
  const topMover = [...sneakers].sort((a, b) => Math.abs(b.price_change_24h || 0) - Math.abs(a.price_change_24h || 0))[0];

  const stats = [
    {
      icon: BarChart3,
      label: 'Media 24h',
      value: `${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(1)}%`,
      color: avgChange >= 0 ? 'text-gain' : 'text-loss',
      bg: avgChange >= 0 ? 'bg-gain/10' : 'bg-loss/10',
      iconColor: avgChange >= 0 ? 'text-gain' : 'text-loss',
    },
    {
      icon: Activity,
      label: 'In salita',
      value: `${rising}/${sneakers.length}`,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: Zap,
      label: 'Top Mover',
      value: topMover?.name?.split(' ').slice(0, 2).join(' ') || '—',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      iconColor: 'text-yellow-400',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map(({ icon: Icon, label, value, color, bg, iconColor }) => (
        <div key={label} className="bg-card rounded-2xl border border-border/50 p-3.5 flex flex-col items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <div className="text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-xs font-bold font-mono ${color} leading-tight`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}