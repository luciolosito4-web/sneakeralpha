import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#4ade80', '#60a5fa', '#f97316', '#a78bfa', '#fb7185', '#facc15', '#34d399', '#f472b6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border/50 rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold text-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value} {payload[0].value === 1 ? 'paio' : 'paia'} ({payload[0].payload.percent}%)</p>
      </div>
    );
  }
  return null;
};

export default function BrandPieChart({ items }) {
  const brandMap = {};
  items.forEach(item => {
    const brand = item.brand || 'Altro';
    brandMap[brand] = (brandMap[brand] || 0) + 1;
  });

  const total = items.length;
  const data = Object.entries(brandMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      percent: Math.round((value / total) * 100),
    }));

  if (data.length < 2) return null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Distribuzione Brand</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-[11px] text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}