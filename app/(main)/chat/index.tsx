
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function ChatPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-white shadow-sm">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">AI Chef</Text>
        </View>
      </View>

      {/* Chat Interface */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl text-gray-700">Welcome to AI Chef!</Text>
        {/* Implement chat functionality here */}
      </View>
    </SafeAreaView>
  );
}