import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

function StarRating({ value, onChange, readOnly = false, size = 'md' }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sz, 'transition-colors',
            (hovered || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
            !readOnly && 'cursor-pointer'
          )}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange?.(star)}
        />
      ))}
    </div>
  );
}

export default function BusinessReviews({ businessId, businessName, me }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['business-reviews', businessId],
    queryFn: () => base44.entities.BusinessReview.filter({ business_id: businessId }),
    enabled: !!businessId,
  });

  const alreadyReviewed = reviews.some(r => r.reviewer_email === me?.email);
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const addMutation = useMutation({
    mutationFn: () => base44.entities.BusinessReview.create({
      business_id: businessId,
      business_name: businessName,
      reviewer_email: me.email,
      reviewer_name: me.full_name || me.email.split('@')[0],
      rating,
      comment,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-reviews', businessId] });
      setRating(0);
      setComment('');
      setShowForm(false);
      toast.success('Recensione pubblicata!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BusinessReview.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-reviews', businessId] }),
  });

  return (
    <div className="space-y-4">
      {/* Header + avg */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Recensioni</h3>
          {reviews.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'recensione' : 'recensioni'}
            </span>
          )}
        </div>
        {me && !alreadyReviewed && !showForm && (
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setShowForm(true)}>
            + Aggiungi
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-secondary/40 rounded-xl border border-border/50 p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Il tuo voto</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Textarea
            placeholder="Racconta la tua esperienza con questo venditore..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-secondary border-border/50 resize-none h-20 text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={() => addMutation.mutate()}
              disabled={rating === 0 || addMutation.isPending}
            >
              {addMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Pubblica'}
            </Button>
            <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => setShowForm(false)}>
              Annulla
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nessuna recensione ancora. Sii il primo!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="bg-card rounded-xl border border-border/50 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{review.reviewer_name}</span>
                  <StarRating value={review.rating} readOnly size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {review.created_date ? format(new Date(review.created_date), 'd MMM yyyy', { locale: it }) : ''}
                  </span>
                  {me?.email === review.reviewer_email && (
                    <button onClick={() => deleteMutation.mutate(review.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}