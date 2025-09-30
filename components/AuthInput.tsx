import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, Text, View, TextInputProps, TouchableOpacity } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  onIconPress?: () => void;
}

export const AuthInput = ({ label, icon, error, onIconPress, ...props }: AuthInputProps) => {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-base font-semibold text-gray-700">{label}</Text>
      <View className="relative">
        <TextInput
          className={`border-2 bg-white ${
            error ? 'border-red-500' : 'border-gray-100'
          } rounded-2xl px-4 py-4 text-gray-800 ${icon ? 'pr-12' : ''} shadow-sm`}
          placeholderTextColor="#9CA3AF"
          style={{
            fontSize: 16,
            shadowColor: '#84C94B',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          {...props}
        />
        {icon && (
          <TouchableOpacity onPress={onIconPress} className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Ionicons name={icon} size={24} color="#84C94B" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
    </View>
  );
};
