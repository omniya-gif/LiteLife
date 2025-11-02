import { Lock, Check } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useQueryClient } from 'react-query';

import { useHealthCoins } from '../../hooks/useHealthCoins';
import { Badge } from '../../types/coins';

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
}

export const BadgeCard = ({ badge, isUnlocked }: BadgeCardProps) => {
  const { coins, purchaseBadge } = useHealthCoins();
  const queryClient = useQueryClient();
  const canPurchase = (coins?.balance || 0) >= badge.cost;
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [showUnlocked, setShowUnlocked] = React.useState(isUnlocked);

  React.useEffect(() => {
    setShowUnlocked(isUnlocked);
  }, [isUnlocked]);

  const handlePurchase = async () => {
    if (!canPurchase || isPurchasing) return;
    
    try {
      setIsPurchasing(true);
      await purchaseBadge.mutateAsync({
        id: badge.id,
        cost: badge.cost,
        name: badge.name
      });
      
      // Show unlock animation
      setShowUnlocked(true);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries('user-badges');
      queryClient.invalidateQueries('user-badge-count');
      queryClient.invalidateQueries('health-coins');
      
    } catch (error) {
      console.error('Error purchasing badge:', error);
      setShowUnlocked(false);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Animated.View 
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
      className="bg-[#25262B] rounded-2xl p-4 mb-4"
    >
      <View className="flex-row items-center">
        <Image 
          source={{ uri: badge.icon }}
          className="w-16 h-16 rounded-xl"
        />
        <View className="flex-1 ml-4">
          <Text className="text-white font-medium text-lg">{badge.name}</Text>
          <Text className="text-gray-400">{badge.description}</Text>
        </View>
        {showUnlocked ? (
          <Animated.View 
            entering={FadeIn}
            className="bg-[#4ADE80]/20 p-2 rounded-full"
          >
            <Check size={20} color="#4ADE80" />
          </Animated.View>
        ) : (
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={!canPurchase || isPurchasing}
            className={`flex-row items-center space-x-2 px-4 py-2 rounded-full ${
              isPurchasing 
                ? 'bg-gray-500'
                : canPurchase 
                  ? 'bg-[#4ADE80]' 
                  : 'bg-gray-600'
            }`}
          >
            <Lock size={16} color="white" />
            <Text className="text-white font-medium">
              {isPurchasing ? 'Unlocking...' : badge.cost}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};