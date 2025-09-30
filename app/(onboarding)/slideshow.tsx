import React, { useState, useRef } from 'react';
import { View, Text, Image, Dimensions, FlatList, TouchableOpacity, ImageBackground } from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Meal Planner',
    description: 'Your personal recipe, fitness and nutrition companion for a healthier lifestyle.',
  },
  {
    id: '2',
    title: 'Personalized Meal Plans',
    description: 'Get customized meal plans tailored to your preferences and nutritional goals.',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Monitor your nutrition journey and achieve your health goals with ease.',
  },
];

export default function OnboardingSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const renderItem = ({ item }) => (
    <ImageBackground
      source={require('../../assets/images/background-image/background-cropped-428px-923px.png')}
      style={{ width }}
      className="flex-1"
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 items-center justify-between py-20">
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
            <Text className="text-white text-3xl font-bold mt-6 text-center">
              {item.title}
            </Text>
            <Text className="text-white text-lg mt-4 text-center px-6">
              {item.description}
            </Text>
          </View>

          <View className="w-full px-6 items-center">
            {/* Skip Buttons */}
            <View className="absolute top-12 right-6">
              <TouchableOpacity 
                onPress={() => router.push('/signup')}
                className="bg-white/20 px-6 py-2 rounded-full"
              >
                <Text className="text-white font-semibold">Skip to Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/home')}
                className="bg-white/20 px-6 py-2 rounded-full mt-2"
              >
                <Text className="text-white font-semibold">Skip to Main</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center space-x-3 mb-8">
              {slides.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-6 bg-[#84C94B]' : 'w-2 bg-gray-400'
                  }`}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                if (currentIndex === slides.length - 1) {
                  router.push('/signup'); 
                } else {
                  flatListRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true,
                  });
                }
              }}
              className="w-full bg-[#84C94B] rounded-full py-4 mb-8"
              activeOpacity={0.8}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
            </TouchableOpacity>

            {currentIndex === slides.length - 1 && (
              <View className="flex-row items-center">
                <Text className="text-base text-gray-200">Already a member? </Text>
                <TouchableOpacity onPress={() => router.push('/signin')}> 
                  <Text className="text-base text-[#84C94B] underline">Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </ImageBackground>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={slides}
      renderItem={renderItem}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(event) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(newIndex);
      }}
      getItemLayout={(_, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
    />
  );
}