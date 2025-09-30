import React from 'react';
import { View, Text, Image, ImageBackground } from 'react-native';
import { router } from 'expo-router';

export default function Splash() {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding/slideshow');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/images/background-image/background-cropped-428px-923px.png')}
      className="flex-1"
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <View className="w-24 h-24 bg-[#84C94B] rounded-3xl items-center justify-center mb-4">
              <Image
                source={require('../../assets/images/app-icon/plate-icon.png')}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-semibold">
              <Text className="text-white">Meal</Text>
              <Text className="text-[#84C94B]">Planner</Text>
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}