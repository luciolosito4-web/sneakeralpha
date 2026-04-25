import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Bell, BellOff, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const alertTypeLabels = {
  price_above: 'Prezzo sopra',
  price_below: 'Prezzo sotto',
  change_percent: 'Variazione %',
};

export default function Alerts() {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({ sneaker_name: '', alert_type: 'price_above', target_value: '' });
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.PriceAlert.list('-created_date'),
  });

  const createAlert = useMutation({
    mutationFn: (data) => base44.entities.PriceAlert.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowDialog(false);
      setFormData({ sneaker_name: '', alert_type: 'price_above', target_value: '' });
      toast.success('Alert creato!');
    },
  });

  const toggleAlert = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PriceAlert.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const deleteAlert = useMutation({
    mutationFn: (id) => base44.entities.PriceAlert.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert eliminato');
    },
  });

  return (
    <div className="px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Alert</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs h-8 gap-1">
              <Plus className="w-3.5 h-3.5" />
              Nuovo Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Crea Alert</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">Sneaker</Label>
                <Input
                  placeholder="Nome sneaker"
                  value={formData.sneaker_name}
                  onChange={(e) => setFormData({ ...formData, sneaker_name: e.target.value })}
                  className="bg-secondary border-border/50 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Tipo Alert</Label>
                <Select value={formData.alert_type} onValueChange={(v) => setFormData({ ...formData, alert_type: v })}>
                  <SelectTrigger className="bg-secondary border-border/50 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_above">Prezzo sopra</SelectItem>
                    <SelectItem value="price_below">Prezzo sotto</SelectItem>
                    <SelectItem value="change_percent">Variazione %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">
                  {formData.alert_type === 'change_percent' ? 'Variazione (%)' : 'Prezzo Target (€)'}
                </Label>
                <Input
                  type="number"
                  placeholder={formData.alert_type === 'change_percent' ? '10' : '300'}
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  className="bg-secondary border-border/50 mt-1"
                />
              </div>
              <Button
                onClick={() => createAlert.mutate({
                  ...formData,
                  target_value: parseFloat(formData.target_value),
                  is_active: true,
                  triggered: false,
                })}
                className="w-full h-11"
                disabled={!formData.sneaker_name || !formData.target_value}
              >
                Crea Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nessun alert attivo</p>
          <p className="text-muted-foreground text-xs mt-1">Crea un alert per ricevere notifiche sui prezzi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl bg-card border transition-all",
                alert.is_active ? "border-border/50" : "border-border/20 opacity-60"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                alert.triggered ? "bg-primary/10" : "bg-secondary"
              )}>
                {alert.is_active ? (
                  <Bell className="w-4 h-4 text-primary" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{alert.sneaker_name}</p>
                <p className="text-xs text-muted-foreground">
                  {alertTypeLabels[alert.alert_type]}: {alert.alert_type === 'change_percent' ? `${alert.target_value}%` : `€${alert.target_value}`}
                </p>
              </div>

              <Switch
                checked={alert.is_active}
                onCheckedChange={(checked) => toggleAlert.mutate({ id: alert.id, is_active: checked })}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => deleteAlert.mutate(alert.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}