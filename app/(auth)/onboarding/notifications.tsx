import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Zap, PersonStanding } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const features = [
  {
    icon: <Bell size={20} color="#4ADE80" />,
    title: 'New weekly healthy reminder',
    description: 'Get weekly updates on your progress'
  },
  {
    icon: <Zap size={20} color="#4ADE80" />,
    title: 'Motivational reminder',
    description: 'Stay motivated with daily quotes'
  },
  {
    icon: <PersonStanding size={20} color="#4ADE80" />,
    title: 'Personalised program',
    description: 'Get customized workout plans'
  }
];

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="h-2 flex-1 mx-4 rounded-full bg-[#2C2D32]">
          <View className="h-2 w-full rounded-full bg-[#4ADE80]" />
        </View>
        <TouchableOpacity>
          <Text className="text-[#4ADE80] font-medium">Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Title Section */}
      <Animated.View 
        entering={FadeInDown.delay(200)}
        className="px-6 mt-12"
      >
        <Text className="text-[#4ADE80] text-center font-medium">
          STEP 8/8
        </Text>
        <Text className="text-white text-center text-2xl font-bold mt-4">
          Do you want to turn on notification?
        </Text>
      </Animated.View>

      {/* Illustration */}
      <Animated.View 
        entering={FadeInDown.delay(300)}
        className="items-center justify-center mt-12"
      >
        <View className="w-48 h-48 rounded-full bg-[#4ADE80]/10 items-center justify-center">
          <Bell size={80} color="#4ADE80" />
        </View>
      </Animated.View>

      {/* Features */}
      <View className="px-12 mt-12">
        {features.map((feature, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(400 + index * 100)}
            className="flex-row items-center mb-6"
          >
            <View className="w-10 h-10 rounded-full bg-[#4ADE80]/10 items-center justify-center">
              {feature.icon}
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-medium">{feature.title}</Text>
              <Text className="text-gray-400 text-sm">{feature.description}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Allow Button */}
      <Animated.View 
        entering={FadeIn.delay(700)}
        className="px-6 mt-auto mb-6"
      >
        <TouchableOpacity
          onPress={() => router.push('/(main)/home')}
          className="w-full bg-[#4ADE80] h-14 rounded-2xl items-center justify-center"
        >
          <Text className="text-[#1A1B1E] font-semibold text-lg">
            Allow
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}