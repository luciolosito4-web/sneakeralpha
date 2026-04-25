import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, Check, Pencil, Globe, Instagram, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import BusinessReviews from '../components/business/BusinessReviews';

const BUSINESS_TYPES = [
  { value: 'negozio', label: '🏪 Negozio fisico' },
  { value: 'reseller', label: '📦 Reseller' },
  { value: 'sneaker_boutique', label: '👟 Sneaker Boutique' },
  { value: 'dropshipper', label: '🚚 Dropshipper' },
  { value: 'altro', label: '🔧 Altro' },
];

export default function Business() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    business_type: 'negozio',
    description: '',
    city: '',
    website: '',
    instagram_handle: '',
    whatsapp: '',
  });

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['business-account', me?.email],
    queryFn: () => base44.entities.BusinessAccount.filter({ owner_email: me.email }),
    enabled: !!me?.email,
  });

  const account = accounts[0];

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (account) {
        return base44.entities.BusinessAccount.update(account.id, data);
      } else {
        return base44.entities.BusinessAccount.create({ ...data, owner_email: me.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-account'] });
      setEditing(false);
      toast.success('Account business salvato!');
    },
  });

  // Populate form when account loads
  React.useEffect(() => {
    if (account && !editing) {
      setForm({
        business_name: account.business_name || '',
        business_type: account.business_type || 'negozio',
        description: account.description || '',
        city: account.city || '',
        website: account.website || '',
        instagram_handle: account.instagram_handle || '',
        whatsapp: account.whatsapp || '',
      });
    }
  }, [account]);

  const startEdit = () => {
    if (account) {
      setForm({
        business_name: account.business_name || '',
        business_type: account.business_type || 'negozio',
        description: account.description || '',
        city: account.city || '',
        website: account.website || '',
        instagram_handle: account.instagram_handle || '',
        whatsapp: account.whatsapp || '',
      });
    }
    setEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-10 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Business</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gestisci il profilo della tua attività</p>
        </div>
        {account && !editing && (
          <Button variant="ghost" size="sm" className="gap-2 text-xs" onClick={startEdit}>
            <Pencil className="w-3.5 h-3.5" />
            Modifica
          </Button>
        )}
      </div>

      {/* No account yet */}
      {!account && !editing && (
        <div className="bg-card rounded-2xl border border-border/50 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-1">Crea il tuo profilo business</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Sei un negozio, reseller o boutique? Crea un account business per aumentare la tua visibilità sulla piattaforma.
          </p>
          <div className="space-y-2 text-left mb-5">
            {['Profilo attività dedicato', 'Contatti diretti (WhatsApp, Instagram, sito)', 'Badge Business nel marketplace', 'Annunci evidenziati nella tua città'].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
          <Button className="w-full h-11" onClick={() => setEditing(true)}>
            <Building2 className="w-4 h-4 mr-2" />
            Crea account business
          </Button>
        </div>
      )}

      {/* Form */}
      {editing && (
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider">{account ? 'Modifica attività' : 'Nuova attività'}</h2>

          <div>
            <Label className="text-xs">Nome attività *</Label>
            <Input
              placeholder="es. Sole Sneaker Store"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              className="bg-secondary border-border/50 mt-1 h-9"
            />
          </div>

          <div>
            <Label className="text-xs">Tipo di attività *</Label>
            <Select value={form.business_type} onValueChange={(v) => setForm({ ...form, business_type: v })}>
              <SelectTrigger className="bg-secondary border-border/50 mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Descrizione</Label>
            <Textarea
              placeholder="Descrivi la tua attività..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-secondary border-border/50 mt-1 resize-none h-20 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Città</Label>
              <Input
                placeholder="Milano"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="bg-secondary border-border/50 mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">WhatsApp</Label>
              <Input
                placeholder="+39 333 000 0000"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="bg-secondary border-border/50 mt-1 h-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Sito web</Label>
            <Input
              placeholder="https://mystore.it"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="bg-secondary border-border/50 mt-1 h-9"
            />
          </div>

          <div>
            <Label className="text-xs">Instagram</Label>
            <Input
              placeholder="@mystore"
              value={form.instagram_handle}
              onChange={(e) => setForm({ ...form, instagram_handle: e.target.value })}
              className="bg-secondary border-border/50 mt-1 h-9"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 h-10"
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.business_name || saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Salva
            </Button>
            <Button variant="outline" className="h-10 px-4" onClick={() => setEditing(false)}>
              Annulla
            </Button>
          </div>
        </div>
      )}

      {/* Account preview */}
      {account && !editing && (
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold">{account.business_name}</h2>
                {account.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    VERIFICATO
                  </span>
                )}
              </div>
              <p className="text-xs text-primary font-medium mt-0.5">
                {BUSINESS_TYPES.find(t => t.value === account.business_type)?.label}
              </p>
              {account.description && (
                <p className="text-xs text-muted-foreground mt-2">{account.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border/50">
            {account.city && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{account.city}</span>
              </div>
            )}
            {account.website && (
              <a href={account.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{account.website}</span>
              </a>
            )}
            {account.instagram_handle && (
              <a href={`https://instagram.com/${account.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Instagram className="w-4 h-4 flex-shrink-0" />
                <span>{account.instagram_handle}</span>
              </a>
            )}
            {account.whatsapp && (
              <a href={`https://wa.me/${account.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-400 hover:underline">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{account.whatsapp}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Recensioni */}
      {account && !editing && (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <BusinessReviews businessId={account.id} businessName={account.business_name} me={me} />
        </div>
      )}
    </div>
  );
}