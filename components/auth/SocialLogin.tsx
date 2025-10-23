import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

const socialData = [
  { key: 'google', label: 'Google', icon: require('../../assets/images/social/google.png') },
  { key: 'facebook', label: 'Facebook', icon: require('../../assets/images/social/facebook.png') },
  { key: 'twitter', label: 'Twitter', icon: require('../../assets/images/social/twitter.png') }
];

export const SocialLogin = () => {
  return (
    <>
      <View className="flex-row items-center mb-8">
        <View className="flex-1 h-[1px] bg-[#4ADE80]/20" />
        <Text className="text-[#4ADE80]/60 mx-4">or continue with</Text>
        <View className="flex-1 h-[1px] bg-[#4ADE80]/20" />
      </View>

      <View className="flex-row justify-center space-x-12">
        {socialData.map((provider) => (
          <TouchableOpacity 
            key={provider.key}
            className="h-16 w-16 items-center justify-center rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30"
          >
            <Image
              source={provider.icon}
              className="h-9 w-9"
              resizeMode="cover"
              style={{ transform: [{ scale: 1.2 }] }}
              onError={(error) => console.error(`Error loading ${provider.key} icon:`, error)}
            />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};