import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import LottieView from 'lottie-react-native'; // Add import for LottieView
import onlineAnimation from '../../assets/lottie_animations/online.json'; // Import the online animation

type QuickActionCardProps = {
  title: string;
  icon: React.ReactNode;
  onPress?: () => void;
  isOnline?: boolean; // Add isOnline prop
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  icon,
  onPress,
  isOnline, // Destructure isOnline
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="mr-4"
    >
      <View className="w-24 h-24 bg-[#F0F1FF] rounded-3xl items-center justify-center mb-2">
        {icon}
        {isOnline && (
          <LottieView
            source={onlineAnimation} // Use the local Lottie animation
            autoPlay
            loop
            style={{ width: 24, height: 24, position: 'absolute', top: 2, right: 2 }} // Increased size from 16 to 24 and adjusted position
          />
        )}
      </View>
      <Text className="text-center text-sm font-medium text-gray-800">{title}</Text>
    </TouchableOpacity>
  );
};