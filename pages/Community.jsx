import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Users, MapPin, ChevronRight, Trophy } from 'lucide-react';
import SponsoredBanner from '../components/marketplace/SponsoredBanner';
import Leaderboard from '../components/community/Leaderboard';
import BusinessMap from '../components/community/BusinessMap.jsx';
import { cn } from '@/lib/utils';

const tabs = [
  { key: 'leaderboard', label: '🏆 Leaderboard' },
  { key: 'community', label: '👥 Armadi' },
  { key: 'market', label: '🏷️ In vendita' },
  { key: 'map', label: '🗺️ Mappa' },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState('leaderboard');

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 50),
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ['all-portfolio-items'],
    queryFn: () => base44.entities.PortfolioItem.list('-created_date', 200),
  });

  // Deduplicazione per user_email, mantieni il più recente
  const uniqueProfiles = Array.from(
    new Map(profiles.map(p => [p.user_email, p])).values()
  );

  const profilesWithStats = uniqueProfiles.map(profile => {
    const items = allItems.filter(i => i.created_by === profile.user_email);
    const totalInvested = items.reduce((sum, i) => sum + (i.purchase_price || 0), 0);
    const totalValue = items.reduce((sum, i) => sum + (i.current_value || i.purchase_price || 0), 0);
    const roi = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
    return { ...profile, itemCount: items.length, totalValue, totalInvested, roi };
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Community</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-secondary/50 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-semibold transition-all",
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {/* Top 3 hero */}
            <div className="bg-gradient-to-br from-yellow-500/10 via-card to-card rounded-2xl border border-yellow-500/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">ROI Leaderboard</h3>
              </div>
              <p className="text-xs text-muted-foreground">Classifica in base al ritorno sull'investimento del portfolio</p>
            </div>

            {loadingProfiles ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <Leaderboard profilesWithStats={profilesWithStats} />
            )}
          </div>
        )}

        {/* ARMADI TAB */}
        {activeTab === 'community' && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
              {profiles.length} utenti registrati
            </p>
            {loadingProfiles ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : profilesWithStats.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nessun profilo pubblico ancora</p>
              </div>
            ) : (
              <div className="space-y-2">
                {profilesWithStats.map(profile => (
                  <Link
                    key={profile.id}
                    to={`/profile/${profile.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {(profile.username || profile.user_email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{profile.username || 'Utente'}</p>
                      {profile.wardrobe_name && (
                        <p className="text-xs text-primary truncate">🗄 {profile.wardrobe_name}</p>
                      )}
                      {profile.location && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {profile.location}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono font-bold">€{profile.totalValue.toLocaleString()}</p>
                      <p className={`text-[10px] font-mono ${profile.roi >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {profile.roi >= 0 ? '+' : ''}{profile.roi.toFixed(1)}% ROI
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MARKET TAB */}
        {activeTab === 'market' && (
          <SponsoredBanner limit={20} />
        )}

        {/* MAP TAB */}
        {activeTab === 'map' && (
          <BusinessMap />
        )}
      </div>
    </div>
  );
}