import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Bed, Activity, Timer } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  useSharedValue 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

const SleepQualityIndicator = ({ quality, description, isActive, theme }) => (
  <Animated.View
    entering={FadeIn}
    className="items-center"
  >
    <TouchableOpacity 
      className="items-center rounded-2xl p-4"
      style={{ backgroundColor: isActive ? `${theme.primary}10` : theme.backgroundLight }}
    >
      <Text className="text-2xl" style={{ color: isActive ? theme.primary : 'white' }}>
        {quality}
      </Text>
      <Text className="mt-1 text-xs text-gray-400">{description}</Text>
    </TouchableOpacity>
  </Animated.View>
);

const SleepStatBox = ({ icon, value, label, color, theme }) => (
  <Animated.View
    entering={FadeIn}
    className="items-center rounded-2xl p-4"
    style={{ backgroundColor: theme.backgroundLight }}
  >
    <LinearGradient
      colors={[color, color + '40']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="mb-2 rounded-full p-3"
    >
      {icon}
    </LinearGradient>
    <Text className="text-xl font-bold text-white">{value}</Text>
    <Text className="text-xs text-gray-400">{label}</Text>
  </Animated.View>
);

export default function SleepTrackerPage() {
  const router = useRouter();
  const theme = useTheme();
  const [sleepQuality] = useState('Good');
  const starScale = useSharedValue(1);

  React.useEffect(() => {
    starScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const sleepData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{
      data: [7.2, 8.1, 6.5, 7.8, 8.2, 7.9, 7.5],
      color: () => theme.primary,
      strokeWidth: 2
    }]
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Sleep Tracker</Text>
        <View className="w-6" />
      </Animated.View>

      <ScrollView className="flex-1">
        <View className="mt-6 px-6">
          <Animated.View
            entering={FadeIn}
            className="rounded-3xl p-6"
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              className="rounded-3xl p-6"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-medium text-white">Sleep Time</Text>
                  <Text className="mt-1 text-3xl font-bold text-white">7h 45m</Text>
                </View>
                <Animated.View style={starStyle}>
                  <Moon size={40} color="white" />
                </Animated.View>
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-row items-center space-x-2">
                  <Moon size={20} color="white" />
                  <Text className="text-white">10:45 PM</Text>
                </View>
                <View className="h-0.5 w-12 bg-white/20" />
                <View className="flex-row items-center space-x-2">
                  <Sun size={20} color="white" />
                  <Text className="text-white">6:30 AM</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        <View className="mt-8 px-6">
          <Text className="mb-4 text-lg font-bold text-white">Sleep Quality</Text>
          <View className="flex-row justify-between">
            {['Poor', 'Fair', 'Good', 'Excellent'].map((quality) => (
              <SleepQualityIndicator
                key={quality}
                quality={quality === 'Good' ? '😴' : quality === 'Excellent' ? '🌟' : quality === 'Fair' ? '😐' : '😫'}
                description={quality}
                isActive={quality === sleepQuality}
                theme={theme}
              />
            ))}
          </View>
        </View>

        <View className="mt-8 px-6">
          <Text className="mb-4 text-lg font-bold text-white">Sleep Stats</Text>
          <View className="flex-row justify-between">
            <SleepStatBox
              icon={<Bed size={24} color="white" />}
              value="85%"
              label="Sleep Efficiency"
              color={theme.primary}
              theme={theme}
            />
            <SleepStatBox
              icon={<Activity size={24} color="white" />}
              value="96%"
              label="Deep Sleep"
              color="#3B82F6"
              theme={theme}
            />
            <SleepStatBox
              icon={<Timer size={24} color="white" />}
              value="23m"
              label="Time to Sleep"
              color="#A78BFA"
              theme={theme}
            />
          </View>
        </View>

        <View className="mt-8 px-6">
          <Text className="mb-4 text-lg font-bold text-white">Weekly Overview</Text>
          <View className="rounded-2xl p-4" style={{ backgroundColor: theme.backgroundLight }}>
            <LineChart
              data={sleepData}
              width={width - 60}
              height={200}
              chartConfig={{
                backgroundColor: theme.backgroundLight,
                backgroundGradientFrom: theme.backgroundLight,
                backgroundGradientTo: theme.backgroundLight,
                decimalPlaces: 1,
                color: () => theme.primary,
                labelColor: () => '#9CA3AF',
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.primary
                }
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
