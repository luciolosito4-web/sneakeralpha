import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, TrendingUp, TrendingDown, Tag, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings({ me }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    price_spike_enabled: true,
    price_drop_enabled: true,
    new_listing_enabled: true,
    price_threshold: 5,
    frequency: 'realtime',
  });
  const [saved, setSaved] = useState(false);

  const { data: settings = [] } = useQuery({
    queryKey: ['notification-settings', me?.email],
    queryFn: () => base44.entities.UserNotificationSettings.filter({ user_email: me.email }),
    enabled: !!me?.email,
  });

  useEffect(() => {
    if (settings.length > 0) {
      setForm(settings[0]);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings.length > 0) {
        return base44.entities.UserNotificationSettings.update(settings[0].id, data);
      } else {
        return base44.entities.UserNotificationSettings.create({
          ...data,
          user_email: me.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', me?.email] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success('Preferenze salvate');
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      price_spike_enabled: form.price_spike_enabled,
      price_drop_enabled: form.price_drop_enabled,
      new_listing_enabled: form.new_listing_enabled,
      price_threshold: parseFloat(form.price_threshold),
      frequency: form.frequency,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Notifiche</h3>
      </div>

      {/* Toggle notifiche */}
      <div className="space-y-3 bg-card rounded-2xl border border-border/50 p-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tipi di avvisi</h4>

        <div className="space-y-3">
          {/* Price spike */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gain/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gain" />
              </div>
              <div>
                <p className="text-sm font-medium">Aumenti di prezzo</p>
                <p className="text-xs text-muted-foreground">Ricevi avvisi quando una scarpa del tuo portfolio sale</p>
              </div>
            </div>
            <Switch
              checked={form.price_spike_enabled}
              onCheckedChange={(checked) => setForm({ ...form, price_spike_enabled: checked })}
            />
          </div>

          {/* Price drop */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-loss/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-loss" />
              </div>
              <div>
                <p className="text-sm font-medium">Cali di prezzo</p>
                <p className="text-xs text-muted-foreground">Ricevi avvisi quando una scarpa del tuo portfolio scende</p>
              </div>
            </div>
            <Switch
              checked={form.price_drop_enabled}
              onCheckedChange={(checked) => setForm({ ...form, price_drop_enabled: checked })}
            />
          </div>

          {/* New listings */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-400/10 flex items-center justify-center">
                <Tag className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Nuovi annunci</p>
                <p className="text-xs text-muted-foreground">Ricevi avvisi da utenti che segui</p>
              </div>
            </div>
            <Switch
              checked={form.new_listing_enabled}
              onCheckedChange={(checked) => setForm({ ...form, new_listing_enabled: checked })}
            />
          </div>
        </div>
      </div>

      {/* Soglia e frequenza */}
      <div className="space-y-3 bg-card rounded-2xl border border-border/50 p-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Impostazioni avanzate</h4>

        <div className="space-y-3">
          {/* Threshold */}
          <div>
            <Label className="text-xs">Variazione minima richiesta (%)</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={form.price_threshold}
                onChange={(e) => setForm({ ...form, price_threshold: e.target.value })}
                className="bg-secondary border-border/50 h-9 w-20"
              />
              <span className="text-xs text-muted-foreground">Riceverai notifiche solo con variazioni ≥ questo valore</span>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <Label className="text-xs">Frequenza notifiche</Label>
            <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
              <SelectTrigger className="bg-secondary border-border/50 mt-2 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">⚡ In tempo reale</SelectItem>
                <SelectItem value="daily">📅 Una volta al giorno</SelectItem>
                <SelectItem value="weekly">📆 Una volta a settimana</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        className="w-full h-10"
        disabled={saveMutation.isPending || saved}
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Salvato
          </>
        ) : (
          'Salva preferenze'
        )}
      </Button>
    </div>
  );
}