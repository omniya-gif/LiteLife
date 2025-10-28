import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import * as Notifications from 'expo-notifications';

export function useHealthCoins() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: coins, isLoading } = useQuery(
    ['health-coins', user?.id],
    async () => {
      const { data, error } = await supabase
        .from('health_coins')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!user,
      staleTime: 1000 * 60, // 1 minute
    }
  );

  const earnCoins = useMutation(
    async ({ amount, reason }: { amount: number; reason: string }) => {
      const { data, error } = await supabase
        .from('health_coins')
        .upsert({
          user_id: user?.id,
          balance: (coins?.balance || 0) + amount,
          total_earned: (coins?.total_earned || 0) + amount,
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification for earning coins
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Coins Earned!',
          body: `You earned ${amount} health coins for ${reason}!`,
          sound: 'notification.wav',
          data: { type: 'coins_earned' },
        },
        trigger: null,
      });

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['health-coins', user?.id]);
      },
    }
  );

  const purchaseBadge = useMutation(
    async (badge: { id: string; cost: number; name: string }) => {
      if ((coins?.balance || 0) < badge.cost) {
        throw new Error('Insufficient coins');
      }

      const { error } = await supabase.rpc('purchase_badge', {
        badge_id: badge.id,
        badge_cost: badge.cost,
      });

      if (error) throw error;

      // Send notification for badge unlock
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 New Badge Unlocked!',
          body: `Congratulations! You've unlocked the ${badge.name} badge!`,
          sound: 'notification.wav',
          data: { type: 'badge_unlocked' },
        },
        trigger: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['health-coins', user?.id]);
        queryClient.invalidateQueries(['user-badges', user?.id]);
      },
    }
  );

  return {
    coins,
    isLoading,
    earnCoins,
    purchaseBadge,
  };
}