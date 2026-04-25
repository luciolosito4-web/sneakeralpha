import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import SponsorshipPlans from './SponsorshipPlans';

const PLATFORMS = [
  { value: 'vinted', label: 'Vinted' },
  { value: 'ebay', label: 'eBay' },
  { value: 'subito', label: 'Subito.it' },
  { value: 'wallapop', label: 'Wallapop' },
  { value: 'depop', label: 'Depop' },
  { value: 'direct', label: 'Vendita diretta' },
  { value: 'other', label: 'Altro' },
];

const CONDITIONS = [
  { value: 'deadstock', label: 'Deadstock (DS)' },
  { value: 'vnds', label: 'Virtually New (VNDS)' },
  { value: 'used_good', label: 'Usato buone condizioni' },
  { value: 'used_fair', label: 'Usato' },
];

export default function CreateListingDialog({ me, onCreated }) {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({
    sneaker_name: '',
    brand: '',
    size: '',
    condition: 'deadstock',
    asking_price: '',
    platform: 'vinted',
    listing_url: '',
    description: '',
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SponsoredListing.create(data),
    onSuccess: () => {
      setOpen(false);
      setForm({ sneaker_name: '', brand: '', size: '', condition: 'deadstock', asking_price: '', platform: 'vinted', listing_url: '', description: '' });
      setSelectedPlan(null);
      onCreated?.();
      toast.success(selectedPlan ? '🚀 Annuncio sponsorizzato pubblicato!' : 'Annuncio pubblicato!');
    },
  });

  const handleCreate = async () => {
    // Se c'è un piano sponsorship, procedi al pagamento
    if (selectedPlan) {
      try {
        // Crea il listing
        const listingData = {
          ...form,
          asking_price: parseFloat(form.asking_price) || 0,
          seller_email: me.email,
          seller_name: me.full_name,
          is_active: true,
          is_sponsored: true,
          views: 0,
          sponsored_duration: selectedPlan.duration,
          sponsored_price: selectedPlan.price,
        };
        createMutation.mutate(listingData);
      } catch (error) {
        toast.error('Errore nella creazione dell\'annuncio');
      }
    } else {
      // Annuncio senza sponsorship
      createMutation.mutate({
        ...form,
        asking_price: parseFloat(form.asking_price) || 0,
        seller_email: me.email,
        seller_name: me.full_name,
        is_active: true,
        is_sponsored: false,
        views: 0,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
          <Plus className="w-3.5 h-3.5" />
          Vendi
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pubblica annuncio</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">Nome sneaker *</Label>
            <Input
              placeholder="Air Jordan 1 Retro High OG..."
              value={form.sneaker_name}
              onChange={(e) => setForm({ ...form, sneaker_name: e.target.value })}
              className="bg-secondary border-border/50 mt-1 h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Brand</Label>
              <Input
                placeholder="Nike, Jordan..."
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="bg-secondary border-border/50 mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Taglia EU</Label>
              <Input
                placeholder="42"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="bg-secondary border-border/50 mt-1 h-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Condizione</Label>
            <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
              <SelectTrigger className="bg-secondary border-border/50 mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Prezzo (€) *</Label>
              <Input
                type="number"
                placeholder="250"
                value={form.asking_price}
                onChange={(e) => setForm({ ...form, asking_price: e.target.value })}
                className="bg-secondary border-border/50 mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Piattaforma</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger className="bg-secondary border-border/50 mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Link annuncio</Label>
            <Input
              placeholder="https://vinted.it/..."
              value={form.listing_url}
              onChange={(e) => setForm({ ...form, listing_url: e.target.value })}
              className="bg-secondary border-border/50 mt-1 h-9"
            />
          </div>

          <div>
            <Label className="text-xs">Descrizione</Label>
            <Textarea
              placeholder="Condizioni perfette, mai indossate..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-secondary border-border/50 mt-1 resize-none h-16 text-sm"
            />
          </div>

          {/* Sponsorship Plans */}
          <SponsorshipPlans selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />

          <Button
            onClick={handleCreate}
            className="w-full h-11"
            disabled={!form.sneaker_name || !form.asking_price || createMutation.isPending}
          >
            {createMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : selectedPlan ? `🚀 Pubblica - €${selectedPlan.price.toFixed(2)}` : 'Pubblica annuncio'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}