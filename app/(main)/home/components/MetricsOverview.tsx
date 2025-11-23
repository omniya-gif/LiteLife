import { Activity, Droplets, Scale } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { useUserStore } from '../../../../lib/store/userStore';
import { useHealthConnect, readNutritionData, readHydrationData } from '../../../../hooks/useHealthConnect';

const MetricCard = ({ title, value, unit, icon, lastUpdate }) => {
  const theme = useTheme();

  return (
    <View className="min-w-0 flex-1 rounded-2xl bg-[#2C2D32] p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-base font-medium text-gray-400" numberOfLines={1}>
          {title}
        </Text>
        {icon}
      </View>
      <View className="flex-row flex-wrap items-baseline">
        <Text
          className="text-2xl font-bold"
          style={{ color: theme.primary }}
          numberOfLines={1}
          adjustsFontSizeToFit>
          {value}
        </Text>
        <Text className="ml-1 text-sm text-gray-400" numberOfLines={1}>
          {unit}
        </Text>
      </View>
      <Text className="mt-2 text-xs text-gray-500">{lastUpdate}</Text>
    </View>
  );
};

export const MetricsOverview = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { onboarding } = useUserStore();
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayWater, setTodayWater] = useState(0.0);

  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Nutrition' },
    { accessType: 'read', recordType: 'Hydration' },
  ]);

  // Fetch today's metrics from Health Connect
  useEffect(() => {
    const fetchTodayMetrics = async () => {
      // Only fetch if Health Connect is available and has permissions
      if (!healthConnect.isAvailable || !healthConnect.hasPermissions) {
        // Leave as 0 if not available or no permission
        return;
      }

      try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Fetch calories from Health Connect
        const calories = await readNutritionData(
          startOfDay.toISOString(),
          endOfDay.toISOString()
        );
        setTodayCalories(calories);

        // Fetch hydration from Health Connect
        const hydration = await readHydrationData(
          startOfDay.toISOString(),
          endOfDay.toISOString()
        );
        setTodayWater(hydration / 1000); // Convert ml to liters
      } catch (error) {
        console.error('Error fetching Health Connect data:', error);
        // Keep at 0 on error
      }
    };

    fetchTodayMetrics();
  }, [healthConnect.isAvailable, healthConnect.hasPermissions]);

  // Calculate values
  const calorieGoal = onboarding?.daily_calories || 2000;
  const waterGoal = (onboarding?.water_target || 2000) / 1000; // Convert ml to liters
  const currentWeight = onboarding?.current_weight || 0;

  const formatNumber = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
  };

  return (
    <View className="flex-row gap-3">
      <MetricCard
        title="Calories"
        value={formatNumber(todayCalories)}
        unit={`/ ${formatNumber(calorieGoal)}`}
        lastUpdate="Today"
        icon={<Activity size={20} color={theme.primary} />}
      />
      <MetricCard
        title="Water"
        value={todayWater.toFixed(1)}
        unit={`/ ${waterGoal}L`}
        lastUpdate="Today"
        icon={<Droplets size={20} color={theme.primary} />}
      />
      <MetricCard
        title="Weight"
        value={currentWeight.toFixed(1)}
        unit="kg"
        lastUpdate="Profile"
        icon={<Scale size={20} color={theme.primary} />}
      />
    </View>
  );
};
