import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export const BottomNavigation = () => {
  const router = useRouter();

  return (
    <View className="border-t border-[#2C2D32] bg-[#25262B] px-6 py-4">
      <View className="flex-row items-center justify-around">
        <TouchableOpacity className="items-center" onPress={() => router.push('/home')}>
          <Image
            source={{ uri: 'https://img.icons8.com/ios/50/home.png' }}
            style={{ width: 24, height: 24, tintColor: '#4ADE80' }}
          />
          <Text className="mt-1 text-sm text-[#4ADE80]">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.push('/workout')}>
          <Image
            source={{ uri: 'https://img.icons8.com/ios/50/dumbbell.png' }}
            style={{ width: 24, height: 24, tintColor: '#666' }}
          />
          <Text className="mt-1 text-sm text-gray-400">Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.push('/chat')}>
          <LottieView
            source={require('../../../../assets/lottie_animations/chat.json')}
            autoPlay
            loop
            style={{ width: 64, height: 64, marginTop: -16 }}
          />
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.push('/dashboard')}>
          <Image
            source={{ uri: 'https://img.icons8.com/material-outlined/96/statistics.png' }}
            style={{ width: 24, height: 24, tintColor: '#666' }}
          />
          <Text className="mt-1 text-sm text-gray-400">Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => router.push('/favorites')}>
          <Image
            source={{ uri: 'https://img.icons8.com/ios/50/hearts.png' }}
            style={{ width: 24, height: 24, tintColor: '#666' }}
          />
          <Text className="mt-1 text-sm text-gray-400">Favorites</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
