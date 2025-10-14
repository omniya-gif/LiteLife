import { router } from 'expo-router';
import React from 'react';
import { View, Text, Image, ImageBackground } from 'react-native';

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
      className="flex-1">
      <View className="flex-1 bg-black/50">
        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-3xl bg-[#84C94B]">
              <Image
                source={require('../../assets/images/app-icon/plate-icon.png')}
                className="h-16 w-16"
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
