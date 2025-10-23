import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Loader() {
  return (
    <View className="flex-1 items-center justify-center bg-[#1A1B1E]">
      <ActivityIndicator size="large" color="#4ADE80" />
    </View>
  );
}