import React from 'react';
import { View, Text } from 'react-native';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  lastUpdate: string;
  color: string;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, unit, lastUpdate, color, icon }: MetricCardProps) {
  return (
    <View 
      className="p-4 rounded-2xl"
      style={{ backgroundColor: `${color}10` }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-gray-600">{title}</Text>
        {icon && <View>{icon}</View>}
      </View>
      <View className="flex-row items-baseline">
        <Text className="text-2xl font-bold" style={{ color }}>{value}</Text>
        <Text className="text-gray-600 ml-1 text-sm">{unit}</Text>
      </View>
      <Text className="text-gray-400 text-xs mt-2">{lastUpdate}</Text>
    </View>
  );
}