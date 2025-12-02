import { Activity, Droplets, Scale, Footprints } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedProps,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  interpolate
} from 'react-native-reanimated';
import Svg, { Rect, Defs, ClipPath, Path } from 'react-native-svg';

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
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const WaterMetricCard = ({ value, unit, lastUpdate }) => {
  const theme = useTheme();
  const { onboarding } = useUserStore();
  const waterGoalMl = onboarding?.water_target || 2000;
  const waterGoalL = waterGoalMl / 1000;
  const progress = Math.min(value / waterGoalL, 1);

  const waveAnimation = useSharedValue(0);
  const fillHeight = useSharedValue(0);
  
  const cardWidth = (width - 48) / 3 - 10;
  const cardHeight = 120;

  useEffect(() => {
    // Continuous wave animation
    waveAnimation.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Animate fill height
    fillHeight.value = withSpring(progress, {
      damping: 15,
      stiffness: 90,
    });
  }, [progress]);

  // Animated wave path for smooth sine wave
  const animatedWaveProps = useAnimatedProps(() => {
    const waveWidth = cardWidth + 20;
    const amplitude = 6;
    const frequency = 2;
    const phase = waveAnimation.value * Math.PI * 2;
    
    let path = `M -10,${cardHeight}`;
    
    // Create smooth wave using many points
    for (let x = -10; x <= waveWidth; x += 2) {
      const normalizedX = x / waveWidth;
      const y = cardHeight - (fillHeight.value * cardHeight) + 
                Math.sin((normalizedX * frequency * Math.PI * 2) + phase) * amplitude;
      path += ` L ${x},${y}`;
    }
    
    path += ` L ${waveWidth},${cardHeight}`;
    path += ` L -10,${cardHeight}`;
    path += ' Z';
    
    return { d: path };
  });

  // Animated wave path for second wave (offset)
  const animatedWave2Props = useAnimatedProps(() => {
    const waveWidth = cardWidth + 20;
    const amplitude = 8;
    const frequency = 1.5;
    const phase = waveAnimation.value * Math.PI * 2 + Math.PI; // Phase offset
    
    let path = `M -10,${cardHeight}`;
    
    for (let x = -10; x <= waveWidth; x += 2) {
      const normalizedX = x / waveWidth;
      const y = cardHeight - (fillHeight.value * cardHeight) + 
                Math.sin((normalizedX * frequency * Math.PI * 2) + phase) * amplitude - 3;
      path += ` L ${x},${y}`;
    }
    
    path += ` L ${waveWidth},${cardHeight}`;
    path += ` L -10,${cardHeight}`;
    path += ' Z';
    
    return { d: path };
  });

  return (
    <View className="min-w-0 flex-1 rounded-2xl bg-[#2C2D32] overflow-hidden" style={{ position: 'relative', height: cardHeight }}>
      {/* Water Wave SVG with ClipPath */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 }}>
        <Svg width={cardWidth + 10} height={cardHeight} style={{ position: 'absolute', left: -5 }}>
          <Defs>
            <ClipPath id="wave-clip">
              <AnimatedPath animatedProps={animatedWaveProps} />
            </ClipPath>
          </Defs>
          
          {/* Base water fill with wave clip */}
          <AnimatedRect
            x="0"
            y="0"
            width={cardWidth + 10}
            height={cardHeight}
            fill={`${theme.primary}40`}
            clipPath="url(#wave-clip)"
          />
          
          {/* Second wave layer for depth */}
          <AnimatedPath
            animatedProps={animatedWave2Props}
            fill={`${theme.primary}25`}
          />
          
          {/* Main wave layer */}
          <AnimatedPath
            animatedProps={animatedWaveProps}
            fill={`${theme.primary}60`}
          />
        </Svg>
      </View>

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

    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Fetch calories from macronutrient data
      const macros = await readMacronutrientData(
        startOfDay.toISOString(),
        endOfDay.toISOString()
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
