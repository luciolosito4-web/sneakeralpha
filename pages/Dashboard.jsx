import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import TrendingList from '../components/dashboard/TrendingList';
import MarketOverview from '../components/dashboard/MarketOverview';
import HotSneakersToday from '../components/dashboard/HotSneakersToday';
import UpcomingReleases from '../components/dashboard/UpcomingReleases';
import NotificationPanel from '../components/notifications/NotificationPanel';
import { useNotifications } from '../hooks/useNotifications';
import { syncSneakerPrices } from '../lib/sneakerSyncService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = async (e) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 70 && window.scrollY === 0 && !refreshing) {
      setRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['sneakers'] });
      await queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setRefreshing(false);
    }
  };

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: sneakers = [], isLoading: loadingSneakers } = useQuery({
    queryKey: ['sneakers'],
    queryFn: () => base44.entities.Sneaker.list('-price_change_24h', 300),
    refetchInterval: 5 * 60 * 1000, // ogni 5 minuti
  });

  const { data: portfolio = [], isLoading: loadingPortfolio } = useQuery({
    queryKey: ['portfolio', me?.email],
    queryFn: () => base44.entities.PortfolioItem.filter({ created_by: me.email }, '-created_date'),
    enabled: !!me?.email,
    refetchInterval: 10 * 60 * 1000, // ogni 10 minuti
  });

  const { data: profiles = [], isLoading: loadingProfile } = useQuery({
    queryKey: ['my-profile', me?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: me.email }),
    enabled: !!me?.email,
  });

  // Redirect to onboarding if no profile yet
  useEffect(() => {
    if (!loadingProfile && me && profiles.length === 0) {
      navigate('/onboarding');
    }
  }, [loadingProfile, me, profiles, navigate]);

  const { notifications, unreadCount, markAllRead, markOneRead, deleteNotification } = useNotifications(me);

  const isLoading = loadingSneakers || loadingPortfolio;

  return (
    <div className="px-4 pt-10 pb-28 space-y-10" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {refreshing && (
        <div className="flex justify-center -mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <img src="https://i.ibb.co/j9zpDjd4/9eb30ae6b-logo.png" alt="Sneaker Alpha" className="w-8 h-8 rounded-lg" />
            <h1 className="text-2xl font-bold tracking-tight">Sneaker Alpha</h1>
          </div>
          <p className="text-xs text-muted-foreground pl-11">
            Ciao{me?.full_name ? `, ${me.full_name.split(' ')[0]}` : ''} 👋
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={async () => {
              if (syncing) return;
              setSyncing(true);
              try {
                await syncSneakerPrices(sneakers);
                queryClient.invalidateQueries({ queryKey: ['sneakers'] });
                toast.success('Prezzi aggiornati da web');
              } catch (err) {
                toast.error('Errore sincronizzazione');
              } finally {
                setSyncing(false);
              }
            }}
            className={`h-8 w-8 rounded-lg bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-all ${syncing ? 'animate-spin' : ''}`}
            title="Sincronizza prezzi da web"
            disabled={syncing}
          >
            <span className="text-sm">{syncing ? '⚙️' : '🌐'}</span>
          </button>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['sneakers'] });
              queryClient.invalidateQueries({ queryKey: ['portfolio'] });
            }}
            className="h-8 w-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all"
            title="Aggiorna dati cache"
          >
            <span className="text-sm">🔄</span>
          </button>
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
            onMarkOneRead={markOneRead}
            onDeleteNotification={deleteNotification}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Caricamento dati...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Prossimi Lanci */}
          <motion.section custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <span className="text-sm">🚀</span>
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prossimi Lanci</h2>
            </div>
            <UpcomingReleases />
          </motion.section>

          {/* Portfolio */}
          <motion.section custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-sm">💼</span>
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Il mio Portfolio</h2>
            </div>
            {portfolio.length === 0 ? (
              <div className="text-center py-6 bg-card rounded-2xl border border-border/50">
                <p className="text-sm text-muted-foreground">Portfolio vuoto</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Aggiungi le tue sneaker per iniziare</p>
              </div>
            ) : (
              <PortfolioSummary items={portfolio} />
            )}
          </motion.section>

          {/* Mercato */}
          <motion.section custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-sm">📊</span>
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mercato</h2>
            </div>
            <MarketOverview sneakers={sneakers} />
          </motion.section>

          {/* Hot sneakers */}
          <motion.section custom={3} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-sm">🔥</span>
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Trend Oggi</h2>
            </div>
            <HotSneakersToday sneakers={sneakers} />
          </motion.section>

          {/* Trending */}
          <motion.section custom={4} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <span className="text-sm">📈</span>
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">In Salita</h2>
            </div>
            <TrendingList sneakers={sneakers} />
          </motion.section>
        </div>
      )}
    </div>
  );
}