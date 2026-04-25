import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import NotificationSettings from '@/components/settings/NotificationSettings';

const Section = ({ title, children }) => (
  <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
    <div className="px-4 py-3 border-b border-border/50">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
    </div>
    <div className="divide-y divide-border/50">{children}</div>
  </div>
);

const SettingRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between px-4 py-3.5 gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{label}</p>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default function Settings() {
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [prefs, setPrefs] = useState({
    // Visibilità
    profile_public: true,
    wardrobe_public: true,
    show_portfolio_value: true,
    // Notifiche
    notify_price_spike: true,
    notify_price_drop: true,
    notify_new_listing: true,
    notify_followers: true,
  });

  useEffect(() => {
    if (profile?.settings) {
      setPrefs((prev) => ({ ...prev, ...profile.settings }));
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: (settings) => {
      if (profile) {
        return base44.entities.UserProfile.update(profile.id, { settings });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      toast.success('Impostazioni salvate');
    },
  });

  const handleToggle = (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    saveMutation.mutate(updated);
  };

  if (!me) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-10 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/me">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Impostazioni</h1>
        {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
      </div>

      {/* Account info */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-sm">{me.full_name?.[0]?.toUpperCase() || '?'}</span>
        </div>
        <div>
          <p className="text-sm font-semibold">{me.full_name}</p>
          <p className="text-xs text-muted-foreground">{me.email}</p>
        </div>
      </div>

      {/* Visibilità profilo */}
      <Section title="Visibilità profilo">
        <SettingRow
          label="Profilo pubblico"
          description="Gli altri utenti possono trovare il tuo profilo"
          checked={prefs.profile_public}
          onChange={(v) => handleToggle('profile_public', v)}
        />
        <SettingRow
          label="Armadio visibile"
          description="La tua collezione è visibile agli altri utenti"
          checked={prefs.wardrobe_public}
          onChange={(v) => handleToggle('wardrobe_public', v)}
        />
        <SettingRow
          label="Mostra valore portfolio"
          description="Visibile nel tuo profilo pubblico"
          checked={prefs.show_portfolio_value}
          onChange={(v) => handleToggle('show_portfolio_value', v)}
        />
      </Section>

      {/* Notifiche */}
      <NotificationSettings me={me} />

      {/* Account */}
      <Section title="Account">
        <div className="px-4 py-3.5 space-y-2">
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-9 text-sm select-none"
            onClick={() => base44.auth.logout()}
          >
            Esci dall'account
          </Button>
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-9 text-sm gap-2 select-none"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
            Elimina account
          </Button>
        </div>
      </Section>

      {/* Delete account dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Eliminare l'account?</DialogTitle>
            <DialogDescription>
              Questa azione è irreversibile. Tutti i tuoi dati (profilo, portfolio, wishlist, annunci) verranno eliminati definitivamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deletingAccount}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deletingAccount}
              onClick={async () => {
                setDeletingAccount(true);
                if (profile) await base44.entities.UserProfile.delete(profile.id);
                toast.success('Account eliminato');
                setShowDeleteDialog(false);
                base44.auth.logout();
              }}
            >
              {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sì, elimina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}