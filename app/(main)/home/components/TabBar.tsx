import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const tabs = [
  { id: 'health', label: 'Wellness Hub' },
  { id: 'home', label: 'Home' },
  { id: 'recipes', label: 'Recipes' }
];

export const TabBar = ({ activeTab = 'home' }) => {
  const router = useRouter();

  return (
    <View className="border-b border-[#2C2D32] bg-[#25262B] px-6 py-2">
      <View className="flex-row justify-between">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => router.push(`/${tab.id}`)}
            className="relative py-2">
            <Text
              className={`text-lg font-medium text-[#4ADE80]`}>
              {tab.label}
            </Text>
            {activeTab === tab.id && (
              <View className="absolute bottom-0 h-0.5 w-full bg-[#4ADE80]" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};