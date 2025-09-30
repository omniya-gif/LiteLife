import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { UNSPLASH_IMAGES } from '../../../../constants/images';

export const FeaturedArticle = () => {
  return (
    <View className="mb-24">
      <Text className="mb-6 text-2xl font-bold">Featured</Text>
      <TouchableOpacity className="overflow-hidden rounded-3xl bg-white shadow-md">
        <Image
          source={{ uri: UNSPLASH_IMAGES.healthMovement }}
          className="h-56 w-full"
          resizeMode="cover"
        />
        <View className="p-6">
          <View className="mb-3">
            <View className="self-start rounded-full bg-[#FF922C]/10 px-4 py-2">
              <Text className="font-semibold text-[#FF922C]">Nutrition Tips</Text>
            </View>
          </View>
          <Text className="mb-3 text-2xl font-bold">Mastering Meal Prep</Text>
          <Text className="text-lg leading-relaxed text-gray-600">
            Learn how to prepare a week's worth of healthy meals in just 2 hours.
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
