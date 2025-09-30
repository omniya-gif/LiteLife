import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, Image } from 'react-native';
import { Activity } from 'lucide-react-native';
import { UNSPLASH_IMAGES } from '../../../../constants/images';

export const MealPlanSection = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-6"
      contentContainerStyle={{ paddingHorizontal: 24 }}>
      {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => (
        <TouchableOpacity
          key={meal}
          className="mr-4 overflow-hidden rounded-3xl bg-[#25262B]"
          style={{ width: 280 }}>
          <Image
            source={{ uri: UNSPLASH_IMAGES.healthyFood }}
            className="h-40 w-full"
            resizeMode="cover"
          />
          <View className="p-4">
            <Text className="text-lg font-medium text-[#4ADE80]">{meal}</Text>
            <Text className="mt-1 text-xl font-bold text-white">Mediterranean Bowl</Text>
            <View className="mt-2 flex-row items-center">
              <Activity size={20} color="#4ADE80" />
              <Text className="ml-2 text-gray-400">620 calories</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};