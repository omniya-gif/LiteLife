import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  rightIcon?: React.ReactNode;
  error?: string;
  darkMode?: boolean;
  [key: string]: any;
}

export const FloatingLabelInput = ({ 
  label, 
  rightIcon,
  error,
  darkMode = false,
  ...props 
}: FloatingLabelInputProps) => {
  return (
    <View className="mb-4">
      <Text className={`mb-2 text-sm ${error ? 'text-red-500' : 'text-gray-400'}`}>
        {label}
      </Text>
      <View className="relative">
        <TextInput
          {...props}
          className={`w-full rounded-2xl border px-4 py-4 text-base
            ${darkMode ? 'text-white' : 'text-gray-900'}
            ${error ? 'border-red-500' : 'border-[#4ADE80]/20 shadow-lg shadow-[#4ADE80]/10'}
            ${darkMode ? 'bg-[#111112]' : 'bg-white'}`}
          placeholderTextColor={darkMode ? '#666' : '#94A3B8'}
          style={{
            fontSize: 16,
            lineHeight: 20,
          }}
        />
        {rightIcon}
      </View>
      {error && (
        <Text className="mt-1 text-sm text-red-500">{error}</Text>
      )}
    </View>
  );
};