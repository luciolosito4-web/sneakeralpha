import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function FavoriteButton({ itemId, itemType, itemName, itemImage, ownerEmail, className }) {
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myFavorites = [], isLoading } = useQuery({
    queryKey: ['my-favorites', me?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: me.email }),
    enabled: !!me?.email,
  });

  const isFav = myFavorites.some(f => f.item_id === itemId);
  const myFav = myFavorites.find(f => f.item_id === itemId);

  const { data: favCount = [] } = useQuery({
    queryKey: ['fav-count', itemId],
    queryFn: () => base44.entities.Favorite.filter({ item_id: itemId }),
    enabled: !!itemId,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const fav = await base44.entities.Favorite.create({
        user_email: me.email,
        username: me.full_name || me.email.split('@')[0],
        item_id: itemId,
        item_type: itemType,
        item_name: itemName,
        item_image: itemImage,
        owner_email: ownerEmail,
      });

      // Notifica al proprietario (solo se non sei tu il proprietario)
      if (ownerEmail && ownerEmail !== me.email) {
        await base44.entities.Notification.create({
          user_email: ownerEmail,
          type: 'new_listing',
          title: '❤️ Nuovo preferito!',
          body: `Il tuo articolo "${itemName}" è stato aggiunto ai preferiti da ${me.full_name || me.email.split('@')[0]}`,
          sneaker_image: itemImage || null,
          is_read: false,
        });
      }

      return fav;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['fav-count', itemId] });
      toast.success('Aggiunto ai preferiti ❤️');
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => base44.entities.Favorite.delete(myFav.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['fav-count', itemId] });
    },
  });

  if (!me) return null;

  const isPending = addMutation.isPending || removeMutation.isPending || isLoading;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isPending) return;
        isFav ? removeMutation.mutate() : addMutation.mutate();
      }}
      className={cn(
        "flex items-center gap-1 transition-all",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <Heart
          className={cn(
            "w-4 h-4 transition-all",
            isFav ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-400"
          )}
        />
      )}
      {favCount.length > 0 && (
        <span className={cn("text-[10px] font-mono", isFav ? "text-red-400" : "text-muted-foreground")}>
          {favCount.length}
        </span>
      )}
    </button>
  );
}