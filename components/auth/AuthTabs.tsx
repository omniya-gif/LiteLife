import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface AuthTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AuthTabs = ({ activeTab, onTabChange }: AuthTabsProps) => {
  return (
    <View className="flex-row mb-8">
      <TouchableOpacity 
        onPress={() => onTabChange('signin')}
        className="flex-1"
      >
        <Text className={`text-xl font-['Inter'] ${
          activeTab === 'signin' ? 'text-[#4ADE80] font-semibold' : 'text-gray-400'
        }`}>
          Sign In
        </Text>
        {activeTab === 'signin' && (
          <View className="h-0.5 bg-[#4ADE80] mt-2" />
        )}
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => onTabChange('signup')}
        className="flex-1"
      >
        <Text className={`text-xl font-['Inter'] ${
          activeTab === 'signup' ? 'text-[#4ADE80] font-semibold' : 'text-gray-400'
        }`}>
          Sign Up
        </Text>
        {activeTab === 'signup' && (
          <View className="h-0.5 bg-[#4ADE80] mt-2" />
        )}
      </TouchableOpacity>
    </View>
  );
};