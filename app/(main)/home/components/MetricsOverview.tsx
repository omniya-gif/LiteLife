import { Activity, Droplets, Scale } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { useUserStore } from '../../../../lib/store/userStore';
import { supabase } from '../../../../lib/supabase';

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
  const [todayWater, setTodayWater] = useState(0);

  // Fetch today's metrics from database
  useEffect(() => {
    const fetchTodayMetrics = async () => {
      if (!user?.id) return;

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Fetch today's calorie intake
      const { data: calorieData } = await supabase
        .from('meal_logs')
        .select('calories')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (calorieData) {
        const totalCalories = calorieData.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        setTodayCalories(totalCalories);
      }

      // Fetch today's water intake
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('amount')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (waterData) {
        const totalWater = waterData.reduce((sum, log) => sum + (log.amount || 0), 0);
        setTodayWater(totalWater);
      }
    };

    fetchTodayMetrics();
  }, [user?.id]);

  // Calculate values
  const calorieGoal = onboarding?.daily_calories || 2850;
  const waterGoal = 2.5; // Default 2.5L goal
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
