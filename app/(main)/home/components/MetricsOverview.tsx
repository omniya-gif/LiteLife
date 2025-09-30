import React from 'react';
import { View, Text } from 'react-native';
import { Activity, Droplets, Scale } from 'lucide-react-native';

const MetricCard = ({ title, value, unit, icon, lastUpdate }) => (
  <View className="rounded-2xl bg-[#2C2D32] p-4">
    <View className="mb-2 flex-row items-center justify-between">
      <Text className="text-base font-medium text-gray-400">{title}</Text>
      {icon}
    </View>
    <View className="flex-row items-baseline">
      <Text className="text-2xl font-bold text-[#4ADE80]">{value}</Text>
      <Text className="ml-1 text-sm text-gray-400">{unit}</Text>
    </View>
    <Text className="mt-2 text-xs text-gray-500">{lastUpdate}</Text>
  </View>
);

export const MetricsOverview = () => {
  return (
    <View className="flex-row flex-wrap gap-4">
      <View className="flex-1">
        <MetricCard
          title="Calories"
          value="2,158"
          unit="/ 2,850 cal"
          lastUpdate="3m ago"
          icon={<Activity size={20} color="#4ADE80" />}
        />
      </View>
      <View className="flex-1">
        <MetricCard
          title="Water Intake"
          value="1.8"
          unit="/ 2.5L"
          lastUpdate="5m ago"
          icon={<Droplets size={20} color="#4ADE80" />}
        />
      </View>
      <View className="flex-1">
        <MetricCard
          title="Weight"
          value="75.5"
          unit="kg"
          lastUpdate="2h ago"
          icon={<Scale size={20} color="#4ADE80" />}
        />
      </View>
    </View>
  );
};