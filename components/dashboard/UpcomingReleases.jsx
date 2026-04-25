import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Zap, Loader2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const hypeColors = {
  low: 'bg-secondary/50 border-border/50 text-muted-foreground',
  medium: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  high: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  very_high: 'bg-primary/10 border-primary/30 text-primary',
};

export default function UpcomingReleases() {
  const queryClient = useQueryClient();

  // Recupera i lanci prossimi
  const { data: releases = [], isLoading } = useQuery({
    queryKey: ['upcoming-releases'],
    queryFn: () => base44.entities.UpcomingRelease.filter(
      { release_date: { $gte: new Date().toISOString().split('T')[0] } },
      'release_date',
      20
    ),
    refetchInterval: 6 * 60 * 60 * 1000, // Aggiorna ogni 6 ore
  });

  // Mutation per sincronizzare i lanci da web
  const syncMutation = useMutation({
    mutationFn: async () => {
      // Chiama un'API esterna per recuperare i dati
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Cerca i prossimi lanci di sneaker su SNKRS (Nike app ufficiale) e Nike.com per i prossimi 60 giorni. Includi anche dati da Adidas Confirmed e altri brand ufficiali.

        Restituisci un JSON con array di oggetti contenenti:
        - name (nome modello esatto)
        - brand (Nike, Jordan, Adidas, etc - il brand ufficiale)
        - release_date (YYYY-MM-DD, data esatta di lancio)
        - image_url (URL immagine ufficiale)
        - retail_price (prezzo EUR)
        - description (breve descrizione)
        - hype_level (low, medium, high, very_high - basato su demand/buzz)
        - official_link (URL ufficiale del lancio - SNKRS per Nike/Jordan, Adidas Confirmed per Adidas, ecc)
        - resell_platforms (array: vinted, ebay, subito, wallapop, depop)

        Priorità: informazioni da SNKRS ufficiale, Nike.com, Adidas Confirmed.
        Solo lanci confermati e reali. Ordina per release_date crescente.
        Formato: {"releases": [{ ... }]}`,
        add_context_from_internet: true,
        model: 'gemini_3_1_pro',
        response_json_schema: {
          type: 'object',
          properties: {
            releases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  brand: { type: 'string' },
                  release_date: { type: 'string' },
                  image_url: { type: 'string' },
                  retail_price: { type: 'number' },
                  description: { type: 'string' },
                  hype_level: { type: 'string' },
                  official_link: { type: 'string' },
                  resell_platforms: { type: 'array', items: { type: 'string' } },
                }
              }
            }
          }
        },
      });

      if (result?.releases?.length > 0) {
        // Elimina TUTTI i vecchi lanci
        const allReleases = await base44.entities.UpcomingRelease.list('-created_date', 1000);
        if (allReleases.length > 0) {
          await Promise.all(allReleases.map(r => base44.entities.UpcomingRelease.delete(r.id)));
        }

        // Aggiungi i nuovi lanci con official_link
        await base44.entities.UpcomingRelease.bulkCreate(
          result.releases.map(r => ({
            name: r.name,
            brand: r.brand,
            release_date: r.release_date,
            image_url: r.image_url,
            retail_price: r.retail_price,
            description: r.description,
            hype_level: r.hype_level,
            official_link: r.official_link,
            resell_platforms: r.resell_platforms || [],
            source: 'Sync da web',
          }))
        );

        queryClient.invalidateQueries({ queryKey: ['upcoming-releases'] });
      }
    },
  });

  // Sincronizza automaticamente al montaggio
  useEffect(() => {
    // Se non ci sono dati, prova a sincronizzare
    if (releases.length === 0 && !syncMutation.isPending) {
      syncMutation.mutate();
    }
  }, [releases.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div className="text-center py-8 bg-card rounded-2xl border border-border/50">
        <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nessun lancio previsto</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {releases.slice(0, 5).map(release => {
        const daysUntil = Math.ceil(
          (new Date(release.release_date) - new Date()) / (1000 * 60 * 60 * 24)
        );

        const getOfficialLink = () => {
          if (release.official_link) return release.official_link;
          
          if (release.brand === 'Nike' || release.brand === 'Jordan') {
            return `https://www.nike.com/launch?query=${encodeURIComponent(release.name)}`;
          } else if (release.brand === 'Adidas') {
            return `https://www.adidas.com/search?q=${encodeURIComponent(release.name)}`;
          } else if (release.brand === 'New Balance') {
            return `https://www.newbalance.com/pd/${encodeURIComponent(release.name)}`;
          }
          return '#';
        };

        return (
          <a
            key={release.id}
            href={getOfficialLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all group cursor-pointer"
          >
            {/* Immagine */}
            <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
              {release.image_url
                ? <img src={release.image_url} alt={release.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-muted-foreground">👟</div>
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{release.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{release.brand}</span>
                {daysUntil <= 7 && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
                    ⚡ {daysUntil}d
                  </span>
                )}
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${hypeColors[release.hype_level]}`}>
                  {release.hype_level === 'very_high' ? '🔥 Mega Hype' : 
                   release.hype_level === 'high' ? '🔥 Alto hype' :
                   release.hype_level === 'medium' ? '⚡ Medio' : '😴 Basso'}
                </span>
              </div>
            </div>

            {/* Prezzo e data */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold font-mono text-primary">€{release.retail_price?.toFixed(0) || '?'}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(release.release_date).toLocaleDateString('it-IT')}
              </p>
            </div>
            </a>
            );
            })}

      {/* Sync button */}
      <button
        onClick={() => syncMutation.mutate()}
        className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
        disabled={syncMutation.isPending}
      >
        {syncMutation.isPending ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Sincronizzazione...
          </>
        ) : (
          <>
            <Calendar className="w-3 h-3" />
            Aggiorna lanci
          </>
        )}
      </button>
    </div>
  );
}