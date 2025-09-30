import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface AppCardProps {
  title: string;
  icon: any;
  onPress: () => void;
  backgroundColor?: string;
}

export function AppCard({ title, icon, onPress, backgroundColor = '#EEF1F8' }: AppCardProps) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="items-center justify-center p-4 rounded-3xl m-1"
      style={{ backgroundColor, width: 110, height: 110 }}
    >
      <Image source={icon} className="w-12 h-12 mb-2" />
      <Text className="text-center text-gray-800 font-medium">{title}</Text>
    </TouchableOpacity>
  );
}