import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { populateAllPriceHistories } from '@/lib/priceHistoryGenerator';
import { toast } from 'sonner';

export default function PriceHistoryGenerator() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await populateAllPriceHistories();
      toast.success(`✅ Generato storico prezzi per ${result.count} sneaker`);
    } catch (error) {
      toast.error('Errore nella generazione dello storico');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'Generando...' : 'Genera Storico Prezzi'}
    </Button>
  );
}