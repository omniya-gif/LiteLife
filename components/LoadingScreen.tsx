import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoadingScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    </SafeAreaView>
  );
};
