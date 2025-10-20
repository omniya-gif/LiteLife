import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Share2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CircularProgress } from '../../../../components/CircularProgress';

const mockRecipe = {
  id: 1,
  title: 'Salad with wheat and white egg',
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  category: 'BREAKFAST',
  description: 'This diabetic friendly egg white recipe promotes healthy weight loss, lowers high cholesterol.',
  nutrients: {
    carbs: { amount: 100, percentage: 32, color: '#0066FF' },
    protein: { amount: 100, percentage: 72, color: '#7165E3' },
    fat: { amount: 100, percentage: 86, color: '#7EE4F0' }
  }
};

export default function NutritionPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        {/* Header Image */}
        <View className="h-[300px]">
          <Image 
            source={{ uri: mockRecipe.image }}
            className="absolute w-full h-full"
            resizeMode="cover"
          />
          <View className="flex-row items-center justify-between px-6 pt-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="h-12 w-12 items-center justify-center rounded-xl bg-black/20"
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-white">
              <Heart size={16} color="#4ADE80" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <Animated.View 
          entering={FadeInDown.springify()}
          className="bg-[#1A1B1E] -mt-10 rounded-t-[36px] p-6"
        >
          <Text className="text-[#4ADE80] text-sm font-medium">{mockRecipe.category}</Text>
          <Text className="text-white text-xl font-medium mt-3">{mockRecipe.title}</Text>
          <Text className="text-gray-400 mt-2">{mockRecipe.description}</Text>

          {/* Nutrition Facts */}
          <Text className="text-white text-xl font-medium mt-6">Nutrition Facts</Text>
          
          <View className="flex-row justify-around mt-6">
            {Object.entries(mockRecipe.nutrients).map(([key, data], index) => (
              <View key={key} className="items-center">
                <CircularProgress
                  size={72}
                  strokeWidth={8}
                  progress={data.percentage / 100}
                  colors={[data.color]}
                />
                <Text className="text-white text-center mt-2">{data.percentage}%</Text>
              </View>
            ))}
          </View>

          {/* Detailed Nutrients */}
          <View className="mt-8">
            {Object.entries(mockRecipe.nutrients).map(([key, data], index) => (
              <View key={key} className="flex-row items-center justify-between py-3 border-b border-[#2C2D32]">
                <View className="flex-row items-center">
                  <View 
                    className="h-6 w-6 rounded-lg mr-4"
                    style={{ backgroundColor: data.color }}
                  />
                  <Text className="text-white capitalize">{key}</Text>
                </View>
                <Text className="text-white">{data.amount}g</Text>
                <Text className="text-white">{data.percentage}%</Text>
              </View>
            ))}
          </View>

          {/* Serving Size */}
          <View className="mt-6 bg-[#25262B] rounded-2xl p-4 flex-row items-center justify-between">
            <Text className="text-white">1</Text>
            <View className="h-8 w-[1px] bg-[#2C2D32] mx-4" />
            <Text className="text-white flex-1">Serving (200g)</Text>
            <View className="h-8 w-8 items-center justify-center">
              <ArrowLeft size={20} color="white" style={{ transform: [{ rotate: '-90deg' }] }} />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row mt-6">
            <TouchableOpacity className="h-[54px] w-[54px] bg-[#4ADE80]/10 rounded-2xl items-center justify-center">
              <Share2 size={20} color="#4ADE80" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/journal')}
              className="h-[54px] flex-1 bg-[#4ADE80] rounded-2xl items-center justify-center ml-6"
            >
              <Text className="text-white font-medium">Add to Journal</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}