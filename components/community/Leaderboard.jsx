import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const medals = ['🥇', '🥈', '🥉'];

const rankColors = [
  'from-yellow-500/10 border-yellow-500/30',
  'from-slate-400/10 border-slate-400/30',
  'from-orange-600/10 border-orange-600/30',
];

export default function Leaderboard({ profilesWithStats }) {
  const sorted = [...profilesWithStats]
    .filter(p => p.roi !== undefined)
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 bg-card rounded-2xl border border-border/50">
        <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nessun dato disponibile</p>
        <p className="text-xs text-muted-foreground mt-1">Gli utenti devono avere un portfolio attivo</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((profile, i) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <Link
            to={`/profile/${profile.id}`}
            className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r border transition-all ${
              i < 3 ? rankColors[i] : 'bg-card border-border/50 hover:border-primary/30'
            } ${i < 3 ? 'bg-card' : ''}`}
          >
          {/* Rank */}
          <div className="w-8 text-center flex-shrink-0">
            {i < 3
              ? <span className="text-lg">{medals[i]}</span>
              : <span className="text-sm font-bold font-mono text-muted-foreground">{i + 1}</span>
            }
          </div>

          {/* Avatar */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
            i === 0 ? 'bg-yellow-500/20' : i === 1 ? 'bg-slate-400/20' : i === 2 ? 'bg-orange-600/20' : 'bg-primary/10'
          }`}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className={`font-bold text-sm ${
                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-primary'
              }`}>
                {(profile.username || profile.user_email || '?')[0].toUpperCase()}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{profile.username || 'Utente'}</p>
            {profile.wardrobe_name && (
              <p className="text-[10px] text-muted-foreground truncate">🗄 {profile.wardrobe_name}</p>
            )}
            {profile.location && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                <MapPin className="w-2.5 h-2.5" />{profile.location}
              </p>
            )}
          </div>

          {/* ROI */}
          <div className="text-right flex-shrink-0">
            <p className={`text-base font-bold font-mono ${profile.roi >= 0 ? 'text-gain' : 'text-loss'}`}>
              {profile.roi >= 0 ? '+' : ''}{profile.roi.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">ROI · {profile.itemCount} paia</p>
          </div>
        </Link>
        </motion.div>
      ))}
    </div>
  );
}