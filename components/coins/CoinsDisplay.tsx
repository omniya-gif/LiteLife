import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Coins } from 'lucide-react-native';
import { useHealthCoins } from '../../hooks/useHealthCoins';
import Animated, { FadeIn } from 'react-native-reanimated';

export const CoinsDisplay = () => {
  const { coins, isLoading } = useHealthCoins();

  if (isLoading) return null;

  return (
    <Animated.View 
      entering={FadeIn}
      className="flex-row items-center bg-[#25262B] rounded-full px-4 py-2"
    >
      <Coins size={20} color="#4ADE80" />
      <Text className="text-white font-medium ml-2">
        {coins?.balance || 0}
      </Text>
    </Animated.View>
  );
};