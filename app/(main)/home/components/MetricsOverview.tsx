import { Activity, Droplets, Scale, Footprints } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import { useAuth } from '../../../../hooks/useAuth';
import { useTheme } from '../../../../hooks/useTheme';
import { useUserStore } from '../../../../lib/store/userStore';
import { 
  useHealthConnect, 
  readMacronutrientData, 
  readStepsData,
  readHydrationData 
} from '../../../../hooks/useHealthConnect';

const { width } = Dimensions.get('window');

const WaterMetricCard = ({ value, unit, lastUpdate }) => {
  const theme = useTheme();
  const { onboarding } = useUserStore();
  const lottieRef = useRef<LottieView>(null);
  const waterGoalMl = onboarding?.water_target || 2000;
  const waterGoalL = waterGoalMl / 1000;
  const progress = Math.min(value / waterGoalL, 1);

  const animatedProgress = useSharedValue(0);
  const cardWidth = (width - 48) / 3 - 10;
  const cardHeight = 120;

  useEffect(() => {
    // Animate progress
    animatedProgress.value = withSpring(progress, {
      damping: 15,
      stiffness: 90,
    });
    
    // Play lottie animation
    lottieRef.current?.play();
  }, [progress]);

  // Animated styles for the water container
  const waterContainerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animatedProgress.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      height: `${height}%`,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
    };
  });

  return (
    <View className="min-w-0 flex-1 rounded-2xl bg-[#2C2D32] overflow-hidden" style={{ position: 'relative', height: cardHeight }}>
      {/* Lottie Water Animation */}
      <Animated.View style={waterContainerStyle}>
        <View style={{ 
          position: 'absolute',
          bottom: -20,
          left: -10,
          right: -10,
          height: cardHeight + 40,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <LottieView
            ref={lottieRef}
            source={require('../../../../assets/lottie_animations/Water Animation.json')}
            autoPlay
            loop
            style={{ 
              width: cardWidth + 40, 
              height: cardHeight + 40,
            }}
          />
        </View>
      </Animated.View>

      {/* Content */}
      <View className="p-4 relative z-10" style={{ flex: 1, justifyContent: 'space-between' }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-gray-400" numberOfLines={1}>
            Water
          </Text>
          <Droplets size={20} color={theme.primary} />
        </View>
        <View>
          <View className="flex-row flex-wrap items-baseline">
            <Text
              className="text-2xl font-bold text-white"
              numberOfLines={1}
              adjustsFontSizeToFit>
              {value}
            </Text>
            <Text className="ml-1 text-sm text-gray-400" numberOfLines={1}>
              {unit}
            </Text>
          </View>
          <Text className="mt-1 text-xs text-gray-500">{lastUpdate}</Text>
        </View>
      </View>
    </View>
  );
};

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
  const [calories, setCalories] = useState(0);
  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0.0);

  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Nutrition' },
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'Hydration' },
  ]);

  // Fetch today's metrics from Health Connect
  const fetchTodayMetrics = async () => {
    // Only fetch if Health Connect is available and initialized
    if (!healthConnect.isAvailable || !healthConnect.isInitialized) {
      console.log('🏠 Home - Health Connect not available or not initialized');
      return;
    }

    // Guard against undefined user email
    if (!user?.email) {
      console.log('🏠 Home - User email not available, skipping data fetch');
      return;
    }

    console.log('🏠 Home - Fetching data for user:', user.email);

    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Fetch calories from macronutrient data (user-scoped)
      const macros = await readMacronutrientData(
        startOfDay.toISOString(),
        endOfDay.toISOString(),
        user.email
      );
      console.log('🏠 Home - Fetched calories from Health Connect:', macros.calories);
      setCalories(macros.calories);

      // Fetch steps
      const totalSteps = await readStepsData(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );
      console.log('🏠 Home - Fetched steps from Health Connect:', totalSteps);
      setSteps(totalSteps);

      // Fetch hydration
      const hydration = await readHydrationData(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );
      console.log('🏠 Home - Fetched hydration from Health Connect:', hydration);
      setWater(hydration / 1000); // Convert ml to liters
    } catch (error) {
      console.error('🏠 Home - Error fetching Health Connect data:', error);
    }
  };

  // Fetch on mount and when permissions change
  useEffect(() => {
    fetchTodayMetrics();
  }, [healthConnect.isAvailable, healthConnect.isInitialized]);

  // Refetch when screen comes into focus (e.g., returning from calorie tracker)
  useFocusEffect(
    React.useCallback(() => {
      fetchTodayMetrics();
    }, [healthConnect.isAvailable, healthConnect.isInitialized])
  );

  const calorieGoal = onboarding?.daily_calories || 2000;
  const waterGoal = (onboarding?.water_target || 2000) / 1000;

  const formatNumber = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();
  };

  return (
    <View className="flex-row gap-3">
      <MetricCard
        title="Calories"
        value={formatNumber(calories)}
        unit={`/ ${formatNumber(calorieGoal)}`}
        lastUpdate="Today"
        icon={<Activity size={20} color={theme.primary} />}
      />
      <MetricCard
        title="Steps"
        value={formatNumber(steps)}
        unit="steps"
        lastUpdate="Today"
        icon={<Footprints size={20} color={theme.primary} />}
      />
      <WaterMetricCard
        value={water.toFixed(1)}
        unit={`/ ${waterGoal}L`}
        lastUpdate="Today"
      />
    </View>
  );
};
