
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart } from 'lucide-react-native';

export default function FavoritesPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-white shadow-sm">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Heart size={24} color="#84C94B" />
            <Text className="text-2xl font-bold ml-2 text-gray-800">Favorites</Text>
          </View>
        </View>
      </View>

      {/* Favorites Content */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl text-gray-700">Your favorite recipes will appear here.</Text>
        {/* Implement favorites functionality here */}
      </View>
    </SafeAreaView>
  );
}