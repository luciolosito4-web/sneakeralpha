import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Zap, Star } from 'lucide-react';
import FavoriteButton from '../shared/FavoriteButton';

const platformColors = {
  vinted: 'from-teal-500/20 to-teal-600/10 border-teal-500/30',
  ebay: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  subito: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  wallapop: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  depop: 'from-red-500/20 to-red-600/10 border-red-500/30',
  direct: 'from-primary/20 to-primary/10 border-primary/30',
  other: 'from-secondary to-secondary/50 border-border/50',
};

const platformLabels = {
  vinted: 'Vinted',
  ebay: 'eBay',
  subito: 'Subito.it',
  wallapop: 'Wallapop',
  depop: 'Depop',
  direct: 'Vendita diretta',
  other: 'Altro',
};

function ListingBannerCard({ listing, featured }) {
  const queryClient = useQueryClient();

  const trackView = useMutation({
    mutationFn: () => base44.entities.SponsoredListing.update(listing.id, { views: (listing.views || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sponsored-listings'] }),
  });

  const gradClass = platformColors[listing.platform] || platformColors.other;

  return (
    <a
      href={listing.listing_url || '#'}
      target={listing.listing_url ? '_blank' : undefined}
      rel="noopener noreferrer"
      onClick={() => trackView.mutate()}
      className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r border transition-all hover:scale-[1.01] ${gradClass}`}
    >
      {featured && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5" fill="currentColor" />
          TOP
        </div>
      )}

      <div className="w-12 h-12 rounded-lg bg-black/20 overflow-hidden flex-shrink-0">
        {listing.sneaker_image
          ? <img src={listing.sneaker_image} alt={listing.sneaker_name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl">👟</div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {listing.is_sponsored && (
            <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />
              SPONSORIZZATO
            </span>
          )}
        </div>
        <p className="text-sm font-semibold truncate">{listing.sneaker_name}</p>
        <p className="text-xs text-muted-foreground">
          EU {listing.size} · {listing.condition === 'deadstock' ? 'DS' : listing.condition} · {platformLabels[listing.platform]}
        </p>
        {listing.seller_name && (
          <p className="text-[10px] text-muted-foreground mt-0.5">da {listing.seller_name}</p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-base font-bold font-mono text-primary">€{listing.asking_price}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <FavoriteButton
            itemId={listing.id}
            itemType="listing"
            itemName={listing.sneaker_name}
            itemImage={listing.sneaker_image}
            ownerEmail={listing.seller_email}
          />
          <ExternalLink className="w-3 h-3 text-muted-foreground ml-1" />
          <span className="text-[10px] text-muted-foreground">Vedi</span>
        </div>
      </div>
    </a>
  );
}

export default function SponsoredBanner({ limit = 5 }) {
  const { data: listings = [] } = useQuery({
    queryKey: ['sponsored-listings'],
    queryFn: () => base44.entities.SponsoredListing.filter({ is_active: true }),
  });

  if (listings.length === 0) return null;

  // Sponsored first, then by views desc
  const sorted = [...listings].sort((a, b) => {
    if (a.is_sponsored && !b.is_sponsored) return -1;
    if (!a.is_sponsored && b.is_sponsored) return 1;
    return (b.views || 0) - (a.views || 0);
  }).slice(0, limit);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          In vendita
        </h3>
      </div>
      {sorted.map((listing, idx) => (
        <div key={listing.id} className="relative">
          <ListingBannerCard listing={listing} featured={listing.is_sponsored && idx === 0} />
        </div>
      ))}
    </div>
  );
}