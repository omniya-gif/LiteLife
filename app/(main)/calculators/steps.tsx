import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, Map, Timer, Footprints } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { 
  FadeIn, 
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  useSharedValue,
  FadeInUp
} from 'react-native-reanimated';
import { CircularProgress } from '../../../components/CircularProgress';
import { LinearGradient } from 'expo-linear-gradient';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import { Platform } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

interface StatsItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  gradient: string[];
  delay: number;
}

const StatsItem = ({ icon, value, label, gradient, delay }: StatsItemProps) => {
  const theme = useTheme();
  
  return (
    <Animated.View
      entering={FadeInUp.delay(delay)}
      className="items-center rounded-2xl p-4"
      style={{ backgroundColor: theme.backgroundLight }}
    >
      <LinearGradient
        colors={gradient}
        className="mb-2 rounded-full p-3"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon}
      </LinearGradient>
      <Text className="text-xl font-bold text-white">{value}</Text>
      <Text className="text-xs text-gray-400">{label}</Text>
    </Animated.View>
  );
};

export default function StepsTrackerPage() {
  const router = useRouter();
  const theme = useTheme();
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [calories, setCalories] = useState(0);
  const [floors, setFloors] = useState(0);
  const [goal] = useState(10000);
  const [activeTab, setActiveTab] = useState('WEEK');
  const progress = steps / goal;
  
  // Animation values
  const footprintScale = useSharedValue(1);
  const progressAnimation = useSharedValue(0);

  React.useEffect(() => {
    footprintScale.value = withRepeat(
      withSequence(
        withSpring(1.1),
        withSpring(1)
      ),
      -1,
      true
    );

    progressAnimation.value = withSpring(progress, {
      damping: 15,
      stiffness: 80,
    });

    // Health Connect initialization
    const initializeHealthConnect = async () => {
      if (Platform.OS !== 'android') return;

      try {
        const isInitialized = await initialize();
        if (!isInitialized) return;

        const granted = await requestPermission([
          { accessType: 'read', recordType: 'Steps' },
          { accessType: 'read', recordType: 'Distance' },
          { accessType: 'read', recordType: 'FloorsClimbed' }
        ]);

        if (granted) {
          const now = new Date();
          const startOfDay = new Date(now.setHours(0, 0, 0, 0));
          const endOfDay = new Date(now.setHours(23, 59, 59, 999));

          const timeRangeFilter = {
            operator: 'between' as const,
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString(),
          };

          // Add type definitions for the records
          interface StepsRecord {
            count: number;
          }

          interface DistanceRecord {
            distance: {
              inMeters: number;
            };
          }

          interface FloorsRecord {
            floors: number;
          }

          // Update the records processing
          const stepsRecords = await readRecords('Steps', { timeRangeFilter });
          const totalSteps = (stepsRecords.records as StepsRecord[]).reduce(
            (sum: number, record) => sum + record.count, 
            0
          );
          setSteps(totalSteps);

          // Get distance
          const distanceRecords = await readRecords('Distance', { timeRangeFilter });
          const totalDistance = (distanceRecords.records as DistanceRecord[]).reduce(
            (sum: number, record) => sum + record.distance.inMeters, 
            0
          );
          setDistance(totalDistance);

          // Get floors climbed
          const floorsRecords = await readRecords('FloorsClimbed', { timeRangeFilter });
          const totalFloors = (floorsRecords.records as FloorsRecord[]).reduce(
            (sum: number, record) => sum + record.floors, 
            0
          );
          setFloors(totalFloors);

          // Estimate calories based on activity
          // Rough estimation: 
          // - 0.04 calories per step
          // - 0.17 calories per meter
          // - 0.17 calories per floor climbed
          const estimatedCals = Math.round(
            (totalSteps * 0.04) + 
            (totalDistance * 0.17) + 
            (totalFloors * 0.17)
          );
          setCalories(estimatedCals);

          // Get duration
          const duration = Math.round((totalDistance / 1000) * 60);
          setDuration(duration);
        }
      } catch (error) {
        console.error('Health Connect error:', error);
      }
    };

    if (Platform.OS === 'android') {
      initializeHealthConnect();
    }
  }, []);

  const footprintStyle = useAnimatedStyle(() => ({
    transform: [{ scale: footprintScale.value }],
  }));

  // Sample data for the line chart
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [6000, 7500, 5000, 8000, steps, 0, 0],
        color: () => theme.primary,
        strokeWidth: 2
      },
      {
        data: [5000, 6500, 4000, 7000, steps - 1000, 0, 0],
        color: () => theme.primaryDark,
        strokeWidth: 2
      }
    ]
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="rounded-lg px-6 py-2" style={{ backgroundColor: `${theme.primary}10` }}>
          <Text style={{ color: theme.primary }}>Insight</Text>
        </TouchableOpacity>
      </Animated.View>

      <View className="mt-12 px-6">
        <Animated.View
          entering={FadeIn.delay(300)}
          className="items-center"
        >
          <Text className="text-center text-sm font-medium" style={{ color: theme.primary }}>
            DAILY STEPS
          </Text>
          <Text className="mt-2 text-center text-2xl text-white">
            You have walked {Math.round(progress * 100)}% of your goal
          </Text>
        </Animated.View>
      </View>

      <View className="mt-12 items-center justify-center">
        <View className="relative" style={{ width: 200, height: 200 }}>
          <CircularProgress
            size={200}
            strokeWidth={20}
            progress={progress}
            colors={[theme.primary, theme.primaryDark, theme.primaryDark]}
            gradientStops={[0, 0.5, 1]}
          />
          <Animated.View 
            style={[
              footprintStyle, 
              {
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]}
          >
            <Footprints size={40} color={theme.primary} />
            <Text className="mt-2 text-4xl font-bold text-white">{steps}</Text>
            <Text className="text-gray-400">steps</Text>
          </Animated.View>
        </View>
      </View>

      <View className="mt-9 flex-row justify-between px-6">
        <StatsItem
          icon={<TrendingUp size={24} color="white" />}
          value={`${calories} kcal`}
          label="Calories"
          gradient={[theme.primary, theme.primaryDark]}
          delay={300}
        />
        <StatsItem
          icon={<Map size={24} color="white" />}
          value={`${(distance / 1000).toFixed(1)} km`}
          label="Distance"
          gradient={['#3B82F6', '#2563EB']}
          delay={400}
        />
        <StatsItem
          icon={<Timer size={24} color="white" />}
          value={`${duration} min`}
          label="Duration"
          gradient={['#A78BFA', '#7C3AED']}
          delay={500}
        />
      </View>

      <View className="mt-9 flex-1 rounded-t-[36px] px-6 pt-6" style={{ backgroundColor: theme.backgroundLight }}>
        <View className="flex-row justify-between">
          {['DAY', 'WEEK', 'MONTH'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="rounded-xl px-6 py-3"
              style={{ backgroundColor: activeTab === tab ? theme.primary : 'transparent' }}
            >
              <Text className="text-white">{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View
          entering={FadeIn.delay(600)}
        >
          <LineChart
            data={data}
            width={width - 48}
            height={180}
            chartConfig={{
              backgroundColor: theme.backgroundLight,
              backgroundGradientFrom: theme.backgroundLight,
              backgroundGradientTo: theme.backgroundLight,
              decimalPlaces: 0,
              color: () => theme.primary,
              labelColor: () => '#9CA3AF',
              style: { borderRadius: 16 },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.primary
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}