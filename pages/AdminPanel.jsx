import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ShieldAlert, Users, Trash2, ShieldCheck, Ban, Search, Building2, Star, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const tabs = [
  { key: 'users', label: '👥 Utenti' },
  { key: 'businesses', label: '🏢 Business' },
  { key: 'reviews', label: '⭐ Recensioni' },
  { key: 'listings', label: '🏷️ Annunci' },
];

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');

  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    enabled: me?.role === 'admin',
  });

  const { data: businesses = [], isLoading: loadingBusinesses } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: () => base44.entities.BusinessAccount.list('-created_date', 100),
    enabled: me?.role === 'admin',
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.BusinessReview.list('-created_date', 100),
    enabled: me?.role === 'admin',
  });

  const { data: listings = [], isLoading: loadingListings } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => base44.entities.SponsoredListing.list('-created_date', 100),
    enabled: me?.role === 'admin',
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id) => base44.entities.UserProfile.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-profiles'] }); toast.success('Profilo eliminato'); },
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ id, val }) => base44.entities.BusinessAccount.update(id, { is_verified: val }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-businesses'] }); },
  });

  const toggleBusinessActiveMutation = useMutation({
    mutationFn: ({ id, val }) => base44.entities.BusinessAccount.update(id, { is_active: val }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-businesses'] }); },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.BusinessReview.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Recensione eliminata'); },
  });

  const toggleListingMutation = useMutation({
    mutationFn: ({ id, val }) => base44.entities.SponsoredListing.update(id, { is_active: val }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-listings'] }); },
  });

  if (loadingMe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (me?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-6 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-bold">Accesso negato</h1>
        <p className="text-sm text-muted-foreground">Solo gli admin possono accedere a questa pagina.</p>
        <Link to="/" className="text-primary text-sm hover:underline">← Torna alla home</Link>
      </div>
    );
  }

  const q = search.toLowerCase();

  const filteredProfiles = profiles.filter(p =>
    !q || (p.username || '').toLowerCase().includes(q) || (p.user_email || '').toLowerCase().includes(q)
  );

  const filteredBusinesses = businesses.filter(b =>
    !q || (b.business_name || '').toLowerCase().includes(q) || (b.city || '').toLowerCase().includes(q)
  );

  const filteredReviews = reviews.filter(r =>
    !q || (r.reviewer_name || '').toLowerCase().includes(q) || (r.business_name || '').toLowerCase().includes(q)
  );

  const filteredListings = listings.filter(l =>
    !q || (l.sneaker_name || '').toLowerCase().includes(q) || (l.seller_name || '').toLowerCase().includes(q)
  );

  return (
    <div className="px-4 pt-6 pb-10 min-h-screen space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Gestione community</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Utenti', value: profiles.length, icon: '👥' },
          { label: 'Business', value: businesses.length, icon: '🏢' },
          { label: 'Recensioni', value: reviews.length, icon: '⭐' },
          { label: 'Annunci', value: listings.filter(l => l.is_active).length, icon: '🏷️' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border/50 p-3 text-center">
            <div className="text-lg">{s.icon}</div>
            <p className="text-sm font-bold font-mono">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cerca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border/50 h-9"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-semibold transition-all",
              activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="space-y-2">
          {loadingProfiles ? <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mt-8" /> :
            filteredProfiles.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nessun utente trovato</p> :
            filteredProfiles.map(profile => (
              <div key={profile.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    : <Users className="w-4 h-4 text-primary" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{profile.username || 'Senza username'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{profile.user_email}</p>
                  {profile.location && <p className="text-[10px] text-muted-foreground">{profile.location}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <Link to={`/profile/${profile.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteProfileMutation.mutate(profile.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* BUSINESSES */}
      {activeTab === 'businesses' && (
        <div className="space-y-2">
          {loadingBusinesses ? <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mt-8" /> :
            filteredBusinesses.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nessun business trovato</p> :
            filteredBusinesses.map(biz => (
              <div key={biz.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                <Building2 className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate">{biz.business_name}</p>
                    {biz.is_verified && <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    {!biz.is_active && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 rounded-full">Inattivo</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{biz.city} · {biz.owner_email}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-8 text-xs px-2", biz.is_verified ? "text-primary" : "text-muted-foreground")}
                    onClick={() => toggleVerifiedMutation.mutate({ id: biz.id, val: !biz.is_verified })}
                    title={biz.is_verified ? 'Rimuovi verifica' : 'Verifica'}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-8 text-xs px-2", !biz.is_active ? "text-destructive" : "text-muted-foreground")}
                    onClick={() => toggleBusinessActiveMutation.mutate({ id: biz.id, val: !biz.is_active })}
                    title={biz.is_active ? 'Disattiva' : 'Attiva'}
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-2">
          {loadingReviews ? <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mt-8" /> :
            filteredReviews.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nessuna recensione</p> :
            filteredReviews.map(review => (
              <div key={review.id} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{review.reviewer_name} → {review.business_name}</p>
                  <div className="flex gap-0.5 my-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                    ))}
                  </div>
                  {review.comment && <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => deleteReviewMutation.mutate(review.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          }
        </div>
      )}

      {/* LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-2">
          {loadingListings ? <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mt-8" /> :
            filteredListings.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nessun annuncio</p> :
            filteredListings.map(listing => (
              <div key={listing.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  {listing.sneaker_image
                    ? <img src={listing.sneaker_image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">👟</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{listing.sneaker_name}</p>
                  <p className="text-[10px] text-muted-foreground">{listing.seller_name} · {listing.platform}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold font-mono text-primary">€{listing.asking_price}</p>
                  {!listing.is_active && <span className="text-[10px] text-destructive">Inattivo</span>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 text-xs px-2", !listing.is_active ? "text-destructive" : "text-muted-foreground")}
                  onClick={() => toggleListingMutation.mutate({ id: listing.id, val: !listing.is_active })}
                  title={listing.is_active ? 'Disattiva annuncio' : 'Riattiva annuncio'}
                >
                  <Ban className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}