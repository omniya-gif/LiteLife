import React from 'react';
import { View, Text } from 'react-native';
import { Activity, Droplets, Scale } from 'lucide-react-native';
import { useTheme } from '../../../../hooks/useTheme';

const MetricCard = ({ title, value, unit, icon, lastUpdate }) => {
  const theme = useTheme();
  
  return (
    <View className="flex-1 min-w-0 rounded-2xl bg-[#2C2D32] p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-base font-medium text-gray-400" numberOfLines={1}>{title}</Text>
        {icon}
      </View>
      <View className="flex-row items-baseline flex-wrap">
        <Text className="text-2xl font-bold" style={{ color: theme.primary }} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text className="ml-1 text-sm text-gray-400" numberOfLines={1}>{unit}</Text>
      </View>
      <Text className="mt-2 text-xs text-gray-500">{lastUpdate}</Text>
    </View>
  );
};

export const MetricsOverview = () => {
  const theme = useTheme();
  
  return (
    <View className="flex-row gap-3">
      <MetricCard
        title="Calories"
        value="2,158"
        unit="/ 2,850"
        lastUpdate="3m ago"
        icon={<Activity size={20} color={theme.primary} />}
      />
      <MetricCard
        title="Water Intake"
        value="1.8"
        unit="/ 2.5L"
        lastUpdate="5m ago"
        icon={<Droplets size={20} color={theme.primary} />}
      />
      <MetricCard
        title="Weight"
        value="75.5"
        unit="kg"
        lastUpdate="2h ago"
        icon={<Scale size={20} color={theme.primary} />}
      />
    </View>
  );
};