import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

export default function FollowButton({ profileId, username }) {
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: follows = [], isLoading } = useQuery({
    queryKey: ['my-follows', me?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: me.email }),
    enabled: !!me?.email,
  });

  const isFollowing = follows.some(f => f.following_profile_id === profileId);
  const myFollow = follows.find(f => f.following_profile_id === profileId);

  const followMutation = useMutation({
    mutationFn: () => base44.entities.Follow.create({
      follower_email: me.email,
      following_profile_id: profileId,
      following_username: username,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-follows'] });
      queryClient.invalidateQueries({ queryKey: ['followers-count', profileId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => base44.entities.Follow.delete(myFollow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-follows'] });
      queryClient.invalidateQueries({ queryKey: ['followers-count', profileId] });
    },
  });

  const { data: followersData = [] } = useQuery({
    queryKey: ['followers-count', profileId],
    queryFn: () => base44.entities.Follow.filter({ following_profile_id: profileId }),
    enabled: !!profileId,
  });

  if (!me) return null;

  const isPending = followMutation.isPending || unfollowMutation.isPending || isLoading;

  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <p className="text-sm font-bold font-mono">{followersData.length}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Follower</p>
      </div>
      <Button
        onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
        disabled={isPending}
        size="sm"
        variant={isFollowing ? 'outline' : 'default'}
        className={`gap-2 text-xs h-9 ${isFollowing ? 'border-primary/30 text-primary' : ''}`}
      >
        {isPending
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : isFollowing
            ? <><UserCheck className="w-3.5 h-3.5" />Seguito</>
            : <><UserPlus className="w-3.5 h-3.5" />Segui</>
        }
      </Button>
    </div>
  );
}