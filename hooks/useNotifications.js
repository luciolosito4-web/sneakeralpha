import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const PRICE_CHANGE_THRESHOLD = 5; // % di variazione considerata significativa

const STORAGE_KEY = 'sa_processed_notifs';

function getProcessed() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); }
}
function addProcessed(key) {
  const set = getProcessed();
  set.add(key);
  // Keep max 500 keys to avoid bloat
  const arr = [...set].slice(-500);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
function hasProcessed(key) { return getProcessed().has(key); }

export function useNotifications(me) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', me?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: me.email }, '-created_date', 50),
    enabled: !!me?.email,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['notification-settings', me?.email],
    queryFn: () => base44.entities.UserNotificationSettings.filter({ user_email: me.email }),
    enabled: !!me?.email,
  });

  const prefs = settings[0] || {};

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', me?.email] }),
  });

  const markOneRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', me?.email] }),
  });

  const deleteNotification = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', me?.email] }),
  });

  // Genera notifiche price spike/drop per il portfolio
  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio-for-notif'],
    queryFn: () => base44.entities.PortfolioItem.list(),
    enabled: !!me?.email,
  });

  const { data: sneakers = [] } = useQuery({
    queryKey: ['sneakers-for-notif'],
    queryFn: () => base44.entities.Sneaker.list(),
    enabled: !!me?.email,
  });

  const createNotif = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', me?.email] }),
  });

  useEffect(() => {
    if (!me?.email || portfolio.length === 0 || sneakers.length === 0) return;

    const threshold = prefs.price_threshold || PRICE_CHANGE_THRESHOLD;
    const processedSneakers = new Set();

    portfolio.forEach(item => {
      const sneaker = sneakers.find(s => s.id === item.sneaker_id || s.name === item.sneaker_name);
      if (!sneaker) return;

      const change = sneaker.price_change_24h;
      if (!change || Math.abs(change) < threshold) return;

      const isSpike = change > 0;
      
      // Controlla se questo tipo di notifica è abilitato
      if (isSpike && !prefs.price_spike_enabled) return;
      if (!isSpike && !prefs.price_drop_enabled) return;

      const key = `spike-${sneaker.id}`;
      if (hasProcessed(key) || processedSneakers.has(sneaker.id)) return;
      
      processedSneakers.add(sneaker.id);
      addProcessed(key);

      createNotif.mutate({
        user_email: me.email,
        type: isSpike ? 'price_spike' : 'price_drop',
        title: isSpike ? `📈 ${sneaker.name} in salita!` : `📉 ${sneaker.name} in calo`,
        body: `Variazione del ${change > 0 ? '+' : ''}${change.toFixed(1)}% nelle ultime 24h. Prezzo attuale: €${sneaker.current_price?.toLocaleString()}`,
        link: `/sneaker/${sneaker.id}`,
        sneaker_image: sneaker.image_url,
        is_read: false,
      });
    });
  }, [portfolio, sneakers, me?.email, prefs]);

  // Notifiche per nuovi annunci da utenti seguiti
  const { data: myFollows = [] } = useQuery({
    queryKey: ['my-follows-notif', me?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: me.email }),
    enabled: !!me?.email,
  });

  const { data: recentListings = [] } = useQuery({
    queryKey: ['recent-listings-notif'],
    queryFn: () => base44.entities.SponsoredListing.filter({ is_active: true }, '-created_date', 20),
    enabled: myFollows.length > 0,
  });

  const { data: followedProfiles = [] } = useQuery({
    queryKey: ['followed-profiles-notif', myFollows.map(f => f.following_profile_id).join(',')],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 50),
    enabled: myFollows.length > 0,
  });

  useEffect(() => {
    if (!me?.email || myFollows.length === 0 || recentListings.length === 0 || !prefs.new_listing_enabled) return;

    const followedEmails = followedProfiles
      .filter(p => myFollows.some(f => f.following_profile_id === p.id))
      .map(p => p.user_email);

    recentListings.forEach(listing => {
      if (!followedEmails.includes(listing.seller_email)) return;

      const key = `listing-${listing.id}-${me.email}`;
      if (hasProcessed(key)) return;
      addProcessed(key);

      const seller = followedProfiles.find(p => p.user_email === listing.seller_email);
      createNotif.mutate({
        user_email: me.email,
        type: 'new_listing',
        title: `🏷️ Nuovo annuncio da ${seller?.username || listing.seller_name}`,
        body: `${listing.sneaker_name} EU ${listing.size} · €${listing.asking_price} su ${listing.platform}`,
        link: `/community`,
        sneaker_image: listing.sneaker_image,
        is_read: false,
      });
    });
  }, [myFollows, recentListings, followedProfiles, me?.email, prefs]);

  return { notifications, unreadCount, markAllRead, markOneRead, deleteNotification };
}