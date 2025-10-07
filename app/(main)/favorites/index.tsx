import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart } from 'lucide-react-native';

export default function FavoritesPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-[#25262B]">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Heart size={24} color="#4ADE80" />
            <Text className="text-2xl font-bold ml-2 text-white">Favorites</Text>
          </View>
        </View>
      </View>

      {/* Favorites Content */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl text-white">Your favorite recipes will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}