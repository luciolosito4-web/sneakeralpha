import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, Bookmark, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const priorityConfig = {
  alta:  { label: 'Alta',  className: 'bg-loss/15 text-loss' },
  media: { label: 'Media', className: 'bg-yellow-500/15 text-yellow-400' },
  bassa: { label: 'Bassa', className: 'bg-secondary text-muted-foreground' },
};

const emptyForm = {
  sneaker_name: '', brand: '', size: '', target_price: '', notes: '', priority: 'media',
};

export default function Wishlist() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist', me?.email],
    queryFn: () => base44.entities.WishlistItem.filter({ created_by: me.email }, '-created_date'),
    enabled: !!me?.email,
  });

  const { data: sneakers = [] } = useQuery({
    queryKey: ['sneakers'],
    queryFn: () => base44.entities.Sneaker.list('-price_change_24h', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WishlistItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setOpen(false);
      setForm(emptyForm);
      toast.success('Aggiunto alla Wishlist!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WishlistItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Rimosso dalla Wishlist');
    },
  });

  const handleSneakerSelect = (sneakerId) => {
    const s = sneakers.find(s => s.id === sneakerId);
    if (s) setForm(f => ({ ...f, sneaker_name: s.name, brand: s.brand, current_price: s.current_price, sneaker_id: s.id, sneaker_image: s.image_url }));
  };

  const handleSubmit = () => {
    if (!form.sneaker_name) return;
    createMutation.mutate({
      ...form,
      target_price: form.target_price ? parseFloat(form.target_price) : undefined,
    });
  };

  const totalTarget = items.reduce((s, i) => s + (i.target_price || 0), 0);

  return (
    <div className="px-4 pt-6 pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 h-8 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Aggiungi
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Aggiungi alla Wishlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              {sneakers.length > 0 && (
                <div>
                  <Label className="text-xs">Scegli dal catalogo (opzionale)</Label>
                  <Select onValueChange={handleSneakerSelect}>
                    <SelectTrigger className="bg-secondary border-border/50 mt-1 h-9 text-sm">
                      <SelectValue placeholder="Seleziona sneaker..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sneakers.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.brand} – {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-xs">Nome sneaker *</Label>
                <Input
                  placeholder="es. Nike Air Max 1"
                  value={form.sneaker_name}
                  onChange={e => setForm({ ...form, sneaker_name: e.target.value })}
                  className="bg-secondary border-border/50 mt-1 h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Brand</Label>
                  <Input
                    placeholder="Nike"
                    value={form.brand}
                    onChange={e => setForm({ ...form, brand: e.target.value })}
                    className="bg-secondary border-border/50 mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Taglia (EU)</Label>
                  <Input
                    placeholder="42"
                    value={form.size}
                    onChange={e => setForm({ ...form, size: e.target.value })}
                    className="bg-secondary border-border/50 mt-1 h-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Prezzo target (€)</Label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={form.target_price}
                    onChange={e => setForm({ ...form, target_price: e.target.value })}
                    className="bg-secondary border-border/50 mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs">Priorità</Label>
                  <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="bg-secondary border-border/50 mt-1 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">🔴 Alta</SelectItem>
                      <SelectItem value="media">🟡 Media</SelectItem>
                      <SelectItem value="bassa">⚪ Bassa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Note</Label>
                <Textarea
                  placeholder="es. Solo colorway nero..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="bg-secondary border-border/50 mt-1 resize-none h-16 text-sm"
                />
              </div>
              <Button
                className="w-full h-10 gap-2"
                onClick={handleSubmit}
                disabled={!form.sneaker_name || createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Aggiungi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Sneakers desiderate</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </div>
          {totalTarget > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Budget totale stimato</p>
              <p className="text-2xl font-bold font-mono text-primary">€{totalTarget.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">La tua wishlist è vuota</p>
          <p className="text-muted-foreground text-xs mt-1">Salva le sneakers che vorresti acquistare</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const pConf = priorityConfig[item.priority] || priorityConfig.media;
            const belowTarget = item.current_price && item.target_price && item.current_price <= item.target_price;
            return (
              <div key={item.id} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-secondary flex-shrink-0 overflow-hidden">
                  {item.sneaker_image
                    ? <img src={item.sneaker_image} alt={item.sneaker_name} className="w-full h-full object-contain" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">👟</div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  {item.brand && <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.brand}</p>}
                  <p className="text-sm font-semibold leading-tight truncate">{item.sneaker_name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={pConf.className + ' text-[10px] px-1.5 py-0'}>{pConf.label}</Badge>
                    {item.size && <span className="text-[10px] text-muted-foreground">EU {item.size}</span>}
                    {belowTarget && (
                      <span className="text-[10px] font-semibold text-gain">✓ Prezzo OK!</span>
                    )}
                  </div>
                  {item.notes && <p className="text-[10px] text-muted-foreground mt-1 truncate">{item.notes}</p>}
                </div>

                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  {item.target_price && (
                    <div>
                      <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 justify-end">
                        <Target className="w-2.5 h-2.5" /> Target
                      </p>
                      <p className="text-sm font-bold font-mono text-primary">€{item.target_price.toLocaleString()}</p>
                    </div>
                  )}
                  {item.sneaker_id && (
                    <Link to={`/sneaker/${item.sneaker_id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">Vedi</Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}