import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Badge } from '../../types/coins';
import { useHealthCoins } from '../../hooks/useHealthCoins';
import { Lock, Check } from 'lucide-react-native';

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
}

export const BadgeCard = ({ badge, isUnlocked }: BadgeCardProps) => {
  const { coins, purchaseBadge } = useHealthCoins();
  const canPurchase = (coins?.balance || 0) >= badge.cost;

  const handlePurchase = () => {
    if (!canPurchase) return;
    purchaseBadge.mutate(badge);
  };

  return (
    <View className="bg-[#25262B] rounded-2xl p-4 mb-4">
      <View className="flex-row items-center">
        <Image 
          source={{ uri: badge.icon }}
          className="w-16 h-16 rounded-xl"
        />
        <View className="flex-1 ml-4">
          <Text className="text-white font-medium text-lg">{badge.name}</Text>
          <Text className="text-gray-400">{badge.description}</Text>
        </View>
        {isUnlocked ? (
          <View className="bg-[#4ADE80]/20 p-2 rounded-full">
            <Check size={20} color="#4ADE80" />
          </View>
        ) : (
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={!canPurchase}
            className={`flex-row items-center space-x-2 px-4 py-2 rounded-full ${
              canPurchase ? 'bg-[#4ADE80]' : 'bg-gray-600'
            }`}
          >
            <Lock size={16} color="white" />
            <Text className="text-white font-medium">{badge.cost}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};