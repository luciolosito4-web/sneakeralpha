import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import PortfolioCard from '../components/portfolio/PortfolioCard';
import PortfolioGainBox from '../components/portfolio/PortfolioGainBox';
import BrandPieChart from '../components/portfolio/BrandPieChart';
import { Loader2, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Portfolio() {
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['portfolio', me?.email],
    queryFn: () => base44.entities.PortfolioItem.filter({ created_by: me.email }, '-created_date'),
    enabled: !!me?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PortfolioItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Rimossa dal portfolio');
    },
  });

  return (
    <div className="px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
        <Link to="/explore">
          <Button variant="outline" size="sm" className="text-xs h-8">
            + Aggiungi
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Il tuo portfolio è vuoto</p>
          <p className="text-muted-foreground text-xs mt-1">Esplora le sneakers e aggiungile qui</p>
          <Link to="/explore">
            <Button className="mt-4" size="sm">Esplora sneakers</Button>
          </Link>
        </div>
      ) : (
        <>
          <PortfolioSummary items={items} />
          <PortfolioGainBox items={items} />
          <BrandPieChart items={items} />
          <div className="space-y-3">
            {items.map(item => (
              <PortfolioCard
                key={item.id}
                item={item}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}