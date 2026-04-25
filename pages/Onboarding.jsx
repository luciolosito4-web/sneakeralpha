import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Building2, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1); // 1 = scelta tipo, 2 = dettagli
  const [accountType, setAccountType] = useState(null);
  const [form, setForm] = useState({ username: '', business_name: '' });

  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ['my-profile', me?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: me.email }),
    enabled: !!me?.email,
  });

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.create(data),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      if (accountType === 'business') {
        navigate('/business');
      } else {
        navigate('/');
      }
    },
  });

  const handleContinue = () => {
    if (!accountType) return;
    setStep(2);
  };

  const handleFinish = () => {
    if (createProfileMutation.isPending) return; // Previeni invii multipli
    createProfileMutation.mutate({
      user_email: me.email,
      account_type: accountType,
      username: form.username || me.full_name,
      wardrobe_name: accountType === 'business' ? form.business_name : '',
    });
  };

  if (loadingMe || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Reindirizza se il profilo esiste già
  if (existingProfile?.length > 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-background">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight">Sneaker Alpha</h1>
        <p className="text-sm text-muted-foreground mt-1">Benvenuto{me?.full_name ? `, ${me.full_name}` : ''}!</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
        <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
      </div>

      {/* Step 1: Choose account type */}
      {step === 1 && (
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Che tipo di account vuoi?</h2>
            <p className="text-sm text-muted-foreground mt-1">Potrai cambiarlo in seguito</p>
          </div>

          {/* Privato */}
          <button
            onClick={() => setAccountType('privato')}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
              accountType === 'privato'
                ? 'border-primary bg-primary/10'
                : 'border-border/50 bg-card hover:border-primary/40'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                accountType === 'privato' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-base">Account Privato</p>
                  {accountType === 'privato' && <Check className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Per appassionati e collezionisti. Gestisci il tuo portfolio, traccia i prezzi e vendila community.</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['Portfolio', 'Price alerts', 'Armadio pubblico'].map(f => (
                    <span key={f} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* Business */}
          <button
            onClick={() => setAccountType('business')}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
              accountType === 'business'
                ? 'border-primary bg-primary/10'
                : 'border-border/50 bg-card hover:border-primary/40'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                accountType === 'business' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-base">Account Business</p>
                  {accountType === 'business' && <Check className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Per negozi, reseller e boutique. Profilo aziendale, badge verificato e visibilità avanzata.</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['Badge Business', 'Profilo attività', 'Annunci in evidenza', 'WhatsApp & socials'].map(f => (
                    <span key={f} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          <Button
            className="w-full h-12 text-base font-bold mt-2"
            disabled={!accountType}
            onClick={handleContinue}
          >
            Continua
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-6">
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
              accountType === 'business' ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              {accountType === 'business'
                ? <Building2 className="w-7 h-7 text-primary" />
                : <User className="w-7 h-7 text-primary" />
              }
            </div>
            <h2 className="text-xl font-bold">
              {accountType === 'business' ? 'Configura il tuo business' : 'Personalizza il tuo profilo'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Potrai modificare tutto in seguito</p>
          </div>

          <div>
            <Label className="text-xs">Il tuo username *</Label>
            <Input
              placeholder="sneakerhead_ita"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="bg-secondary border-border/50 mt-1 h-10"
            />
          </div>

          {accountType === 'business' && (
            <div>
              <Label className="text-xs">Nome attività *</Label>
              <Input
                placeholder="es. Sole Sneaker Store"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className="bg-secondary border-border/50 mt-1 h-10"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="h-12 px-4" onClick={() => setStep(1)}>
              Indietro
            </Button>
            <Button
              className="flex-1 h-12 font-bold"
              disabled={createProfileMutation.isPending}
              onClick={handleFinish}
            >
              {createProfileMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : accountType === 'business' ? '🚀 Inizia con il Business' : '👟 Inizia con Sneaker Alpha'
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}