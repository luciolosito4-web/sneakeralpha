import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, User, Instagram, MapPin, Briefcase, ChevronLeft } from 'lucide-react';
import PortfolioCard from '../components/portfolio/PortfolioCard';
import FollowButton from '../components/community/FollowButton';

export default function PublicProfile() {
  const profileId = window.location.pathname.split('/profile/')[1];

  const { data: profiles = [], isLoading: loadingProfile } = useQuery({
    queryKey: ['public-profile', profileId],
    queryFn: () => base44.entities.UserProfile.filter({ id: profileId }),
    enabled: !!profileId,
  });

  const profile = profiles[0];

  const { data: allItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['public-portfolio', profile?.user_email],
    queryFn: () => base44.entities.PortfolioItem.filter({ created_by: profile.user_email }),
    enabled: !!profile?.user_email,
  });

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-muted-foreground">Profilo non trovato</p>
        <Link to="/community" className="text-primary text-sm mt-2 inline-block">← Torna alla community</Link>
      </div>
    );
  }

  const totalInvested = allItems.reduce((sum, i) => sum + (i.purchase_price || 0), 0);
  const totalValue = allItems.reduce((sum, i) => sum + (i.current_value || i.purchase_price || 0), 0);
  const pl = totalValue - totalInvested;
  const plPercent = totalInvested > 0 ? (pl / totalInvested) * 100 : 0;

  return (
    <div className="pb-8 space-y-5">

      {/* ── HERO COVER ── */}
      <div className="relative">
        {/* Cover */}
        <div className="h-44 w-full relative overflow-hidden">
          {profile.cover_url ? (
            <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-secondary" />
          )}
          {/* Back button */}
          <Link
            to="/community"
            className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-full hover:bg-black/60 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Community
          </Link>
        </div>

        {/* Avatar + name row */}
        <div className="px-4">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background overflow-hidden shadow-xl flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <User className="w-9 h-9 text-primary" />
                </div>
              )}
            </div>
            {/* Follow */}
            <div className="mb-1">
              <FollowButton profileId={profileId} username={profile.username} />
            </div>
          </div>

          {/* Name & bio */}
          <div className="space-y-2">
            <div>
              <h1 className="text-xl font-bold">{profile.username || 'Utente'}</h1>
              {profile.wardrobe_name && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium inline-block mt-1">
                  🗄 {profile.wardrobe_name}
                </span>
              )}
            </div>

            {profile.bio && (
              <div className="bg-card rounded-xl border border-border/50 px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground/90">{profile.bio}</p>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              {profile.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </span>
              )}
              {profile.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <Instagram className="w-3 h-3" />
                  @{profile.instagram_handle}
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 bg-card rounded-2xl border border-border/50 p-3">
            <div className="text-center">
              <p className="text-lg font-bold font-mono">{allItems.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Paia</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold font-mono">€{totalValue.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valore</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold font-mono ${pl >= 0 ? 'text-gain' : 'text-loss'}`}>
                {pl >= 0 ? '+' : ''}{plPercent.toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ROI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wardrobe */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            {profile.wardrobe_name || 'Armadio'}
          </h3>
        </div>
        {loadingItems ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : allItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nessuna sneaker nel portfolio</p>
        ) : (
          <div className="space-y-2">
            {allItems.map(item => (
              <PortfolioCard key={item.id} item={item} onDelete={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}