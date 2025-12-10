import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface LoadingAnimationProps {
  messages?: string[];
  size?: number;
  interval?: number;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  messages = [
    'Loading... 🍽️',
    'Hang in there... 🥗',
    'Fetching your delicious data... 🍕',
    'Almost there... 🍔',
    'Cooking up something good... 👨‍🍳',
    'Just a sec... 🥘',
  ],
  size = 100,
  interval = 1500,
}) => {
  const theme = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(messageInterval);
  }, [messages.length, interval]);

  return (
    <View className="items-center py-4">
      <LottieView
        source={require('../assets/lottie_animations/food.json')}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
      <Text className="mt-3 text-lg font-bold" style={{ color: theme.primary }}>
        {messages[messageIndex]}
      </Text>
    </View>
  );
};
