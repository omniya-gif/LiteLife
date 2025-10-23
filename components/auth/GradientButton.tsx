import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  className?: string;
}

export const GradientButton = ({ onPress, title, className = '' }: GradientButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} className={`mb-8 ${className}`}>
      <LinearGradient
        colors={['#4ADE80', '#22C55E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl py-4 px-6"
      >
        <Text className="text-[#1A1B1E] text-center text-lg font-bold">
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};