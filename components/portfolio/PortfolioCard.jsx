import React from 'react';
import PriceChange from '../shared/PriceChange';
import FavoriteButton from '../shared/FavoriteButton';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortfolioCard({ item, onDelete, ownerEmail }) {
  const pl = (item.current_value || item.purchase_price) - item.purchase_price;
  const plPercent = item.purchase_price > 0 ? (pl / item.purchase_price) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
      <div className="w-14 h-14 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
        {item.sneaker_image ? (
          <img src={item.sneaker_image} alt={item.sneaker_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">👟</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.brand}</p>
        <p className="text-sm font-semibold truncate">{item.sneaker_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.size && <span className="text-[10px] text-muted-foreground">EU {item.size}</span>}
          {item.condition && (
            <span className="text-[10px] text-muted-foreground capitalize">
              {item.condition === 'deadstock' ? 'DS' : item.condition.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold font-mono">€{(item.current_value || item.purchase_price)?.toLocaleString()}</p>
        <div className="flex items-center justify-end gap-1">
          <PriceChange value={plPercent} size="xs" showIcon={false} />
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          Acquisto: €{item.purchase_price?.toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <FavoriteButton
          itemId={item.id}
          itemType="portfolio_item"
          itemName={item.sneaker_name}
          itemImage={item.sneaker_image}
          ownerEmail={ownerEmail || item.created_by}
          className="h-8 w-8 justify-center"
        />
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}