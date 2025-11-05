import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../hooks/useTheme';

const tabs = [
  { id: 'health', label: 'Wellness Hub' },
  { id: 'home', label: 'Home' },
  { id: 'recipes', label: 'Recipes' }
];

export const TabBar = ({ activeTab = 'home' }) => {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View className="border-b border-[#2C2D32] bg-[#25262B] px-6 py-2">
      <View className="flex-row justify-between">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => router.push(`/${tab.id}`)}
            className="relative py-2">
            <Text
              className="text-lg font-medium"
              style={{ color: theme.primary }}>
              {tab.label}
            </Text>
            {activeTab === tab.id && (
              <View className="absolute bottom-0 h-0.5 w-full" style={{ backgroundColor: theme.primary }} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};