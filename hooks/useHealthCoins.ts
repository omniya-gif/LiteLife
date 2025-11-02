import * as Notifications from 'expo-notifications';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface HealthCoins {
  user_id: string;
  balance: number;
  total_earned: number;
  updated_at: string;
}

export function useHealthCoins() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: coins, isLoading } = useQuery<HealthCoins>(
    ['health-coins', user?.id],
    async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('health_coins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Return default values if no record exists
      return (
        data || {
          user_id: user.id,
          balance: 0,
          total_earned: 0,
          updated_at: new Date().toISOString(),
        }
      );
    },
    {
      enabled: !!user,
      staleTime: 1000 * 60, // 1 minute
      retry: 3, // Retry failed queries 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
  const earnCoins = useMutation(
    async ({ amount, reason }: { amount: number; reason: string }) => {
      // Get the current session directly from Supabase to ensure we have the latest auth state
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        throw new Error('User not authenticated');
      }

      const currentUser = session.user;

      if (amount <= 0) throw new Error('Amount must be positive');

      // Use RPC call to handle the transaction server-side
      const { data, error } = await supabase.rpc('award_coins', {
        award_user_id: currentUser.id,
        amount,
      });

      if (error) throw error;

      // Send notification for earning coins
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Coins Earned!',
          body: `You earned ${amount} health coins for ${reason}!`,
          sound: 'notification.wav',
          data: { type: 'coins_earned', amount, reason },
        },
        trigger: null,
      });

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['health-coins', user?.id]);
      },
      retry: 2,
    }
  );

  const purchaseBadge = useMutation(
    async ({ id, cost, name }: { id: string; cost: number; name: string }) => {
      if (!user) throw new Error('User not authenticated');
      if (!coins) throw new Error('Coins data not loaded');
      if (coins.balance < cost) {
        throw new Error('Insufficient coins');
      }

      // Ensure cost is passed as an integer
      const badgeCost = Math.floor(cost);

      // Use RPC call to handle the transaction server-side
      const { data, error } = await supabase.rpc('purchase_badge', {
        badge_id: id, // id should already be a UUID string
        badge_cost: badgeCost,
      });

      if (error) {
        console.error('Error purchasing badge:', error.message, error.details);
        throw error;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 New Badge Unlocked!',
          body: `Congratulations! You've unlocked the ${name} badge!`,
          sound: 'notification.wav',
          data: { type: 'badge_unlocked', badgeId: id, badgeName: name },
        },
        trigger: null,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['health-coins', user?.id]);
        queryClient.invalidateQueries(['user-badges', user?.id]);
      },
      retry: 2,
    }
  );

  return {
    coins,
    isLoading,
    earnCoins,
    purchaseBadge,
  };
}
