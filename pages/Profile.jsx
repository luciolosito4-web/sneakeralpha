import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Pencil, Check, X, ExternalLink, Crown, Heart, Building2, Settings, Camera, Bookmark, MapPin, Instagram, ImagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import PortfolioCard from '../components/portfolio/PortfolioCard';
import SponsoredBanner from '../components/marketplace/SponsoredBanner';
import CreateListingDialog from '../components/marketplace/CreateListingDialog';
import FavoriteButton from '../components/shared/FavoriteButton';

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['my-profile', me?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: me.email }),
    enabled: !!me?.email,
  });

  const profile = profiles[0];

  const { data: myItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ['portfolio', me?.email],
    queryFn: () => base44.entities.PortfolioItem.filter({ created_by: me.email }, '-created_date'),
    enabled: !!me?.email,
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ['my-listings', me?.email],
    queryFn: () => base44.entities.SponsoredListing.filter({ seller_email: me.email }),
    enabled: !!me?.email,
  });

  const { data: myFavorites = [] } = useQuery({
    queryKey: ['my-favorites', me?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: me.email }),
    enabled: !!me?.email,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        wardrobe_name: profile.wardrobe_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        instagram_handle: profile.instagram_handle || '',
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.UserProfile.update(profile.id, { avatar_url: file_url });
    queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    setUploadingAvatar(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.UserProfile.update(profile.id, { cover_url: file_url });
    queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    setUploadingCover(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create({ ...data, user_email: me.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
      setEditing(false);
      toast.success('Profilo aggiornato!');
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: (id) => base44.entities.SponsoredListing.update(id, { is_active: false }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-listings'] }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.PortfolioItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Rimossa dal portfolio');
    },
  });

  const removeFavMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] });
      toast.success('Rimosso dai preferiti');
    },
  });

  if (!me) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.wardrobe_name || profile?.username || me?.full_name || 'Il mio armadio';

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut', delay },
  });

  return (
    <div className="pb-8 space-y-8">

      {/* ── HERO COVER ── */}
      <motion.div {...fadeUp(0)} className="relative">
        {/* Cover image */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="h-44 w-full relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary to-card">
          {profile?.cover_url ? (
            <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-secondary" />
          )}
        </motion.div>
          {/* Cover upload button */}
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1.5 rounded-full hover:bg-black/60 transition-all"
            disabled={uploadingCover}
          >
            {uploadingCover ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
            Copertina
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

          {/* Top-right action buttons */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-full">
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-full">
                <Bookmark className="w-3.5 h-3.5" />
              </Button>
            </Link>
            </div>
          </motion.div>

        {/* Avatar + name row */}
        <div className="px-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background overflow-hidden shadow-xl">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="w-9 h-9 text-primary" />
                  </div>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? <Loader2 className="w-3 h-3 text-primary-foreground animate-spin" /> : <Camera className="w-3 h-3 text-primary-foreground" />}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 mb-1">
              <Link to="/premium">
                <Button variant="outline" size="icon" className="h-8 w-8 border-yellow-500/30 text-yellow-400 hover:bg-yellow-400/10">
                  <Crown className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link to="/business">
                <Button variant="outline" size="icon" className="h-8 w-8 border-primary/30 text-primary hover:bg-primary/10">
                  <Building2 className="w-3.5 h-3.5" />
                </Button>
              </Link>
              {!editing && (
                <Button size="sm" className="h-8 px-3 text-xs gap-1.5" onClick={() => setEditing(true)}>
                  <Pencil className="w-3 h-3" />
                  Modifica
                </Button>
              )}
            </div>
          </div>

          {/* Name & bio */}
          {editing ? (
            <motion.div {...fadeUp(0.1)} className="space-y-4 bg-card rounded-2xl border border-border/50 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Username pubblico</Label>
                  <Input placeholder="sneakerhead_ita" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="bg-secondary border-border/50 mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Nome Armadio</Label>
                  <Input placeholder="La mia collezione" value={form.wardrobe_name} onChange={(e) => setForm({ ...form, wardrobe_name: e.target.value })} className="bg-secondary border-border/50 mt-1 h-9" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Bio</Label>
                <Textarea
                  placeholder="Racconta chi sei, cosa collezzioni, cosa ti appassiona..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="bg-secondary border-border/50 mt-1 resize-none h-24 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Città</Label>
                  <Input placeholder="Milano" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-secondary border-border/50 mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Instagram</Label>
                  <Input placeholder="handle" value={form.instagram_handle} onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })} className="bg-secondary border-border/50 mt-1 h-9" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 h-9 text-xs gap-2" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Salva
                </Button>
                <Button variant="outline" className="h-9 text-xs" onClick={() => setEditing(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div {...fadeUp(0.1)} className="space-y-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">{me.full_name}</h2>
                {profile?.username && (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
              </div>

              {/* Bio card */}
              {profile?.bio ? (
                <div className="bg-card rounded-xl border border-border/50 px-4 py-3">
                  <p className="text-sm leading-relaxed text-foreground/90">{profile.bio}</p>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl px-4 py-3 w-full text-left hover:border-primary/40 transition-colors">
                  + Aggiungi una bio al tuo profilo...
                </button>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 flex-wrap">
                {profile?.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </span>
                )}
                {profile?.instagram_handle && (
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
                {profile?.wardrobe_name && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    🗄 {profile.wardrobe_name}
                  </span>
                )}
              </div>
            </motion.div>
            )}
            </div>

            {/* My Listings */}
      <motion.div {...fadeUp(0.15)} className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider">I miei annunci</h3>
          <CreateListingDialog me={me} onCreated={() => queryClient.invalidateQueries({ queryKey: ['my-listings'] })} />
        </div>

        {myListings.filter(l => l.is_active).length === 0 ? (
          <div className="text-center py-8 bg-card rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground">Nessun annuncio attivo</p>
            <p className="text-xs text-muted-foreground mt-1">Vendi le tue sneakers con un click</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myListings.filter(l => l.is_active).map(listing => (
              <div key={listing.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  {listing.sneaker_image
                    ? <img src={listing.sneaker_image} alt={listing.sneaker_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">👟</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{listing.sneaker_name}</p>
                  <p className="text-xs text-muted-foreground">EU {listing.size} · {listing.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-primary">€{listing.asking_price}</p>
                  {listing.is_sponsored && (
                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">TOP</span>
                  )}
                </div>
                <div className="flex gap-1">
                  {listing.listing_url && (
                    <a href={listing.listing_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteListingMutation.mutate(listing.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Preferiti */}
      {myFavorites.length > 0 && (
        <motion.div {...fadeUp(0.2)} className="px-6">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Preferiti ({myFavorites.length})</h3>
          </div>
          <div className="space-y-2">
            {myFavorites.map(fav => (
              <div key={fav.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  {fav.item_image
                    ? <img src={fav.item_image} alt={fav.item_name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-lg">👟</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{fav.item_name || 'Articolo'}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{fav.item_type === 'listing' ? '🏷️ Annuncio' : '👟 Portfolio'}</p>
                </div>
                <button
                  onClick={() => removeFavMutation.mutate(fav.id)}
                  disabled={removeFavMutation.isPending}
                  className="flex-shrink-0 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  {removeFavMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* My Wardrobe preview */}
      <motion.div {...fadeUp(0.25)} className="px-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
          {displayName}
        </h3>
        {loadingItems ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : myItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Portfolio vuoto</p>
        ) : (
          <div className="space-y-2">
            {myItems.map(item => (
              <PortfolioCard key={item.id} item={item} onDelete={(id) => deleteItemMutation.mutate(id)} />
            ))}
          </div>
        )}
      </motion.div>
      </div>
      );
      }