import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Settings } from 'lucide-react-native'; // Updated import
import React, { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay
} from 'react-native-reanimated';
import { FadeInView } from '../../../components/animations/FadeInView';

import { BottomNavigation } from './components/BottomNavigation';
import { Header } from '../../../components/home/Header'; // Import the reusable header
import { MealPlanSection } from './components/MealPlanSection';
import { MetricsOverview } from './components/MetricsOverview';
import { TabBar } from './components/TabBar';
import { AchievementScore } from './components/AchievementScore';

export default function HomePage() {
  const headerScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerScale.value = withDelay(100, withSpring(1));
    headerOpacity.value = withDelay(100, withSpring(1));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value
  }));

  // Add unique identifiers for days
  const weekDays = [
    { id: 'mon', label: 'M' },
    { id: 'tue', label: 'T' },
    { id: 'wed', label: 'W' },
    { id: 'thu', label: 'T' },
    { id: 'fri', label: 'F' },
    { id: 'sat', label: 'S' },
    { id: 'sun', label: 'S' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        {/* Header Section - Animated */}
        <Animated.View style={headerAnimatedStyle}>
          <Header userName="Amelia" />
        </Animated.View>

        <TabBar activeTab="home" />

        {/* Achievement Score - Now First */}
        <Animated.View 
          entering={FadeInRight.delay(200).springify()}
          className="mt-6 px-6"
        >
          <View className="mb-8">
            <Text className="mb-4 text-2xl font-bold text-white">Achievements</Text>
            <AchievementScore />
          </View>
        </Animated.View>

        {/* Stats Section - Now Second */}
        <FadeInView delay={300}>
          <View className="px-6">
            {/* Today's Overview */}
            <View className="mb-8">
              <Text className="mb-4 text-2xl font-bold text-white">Today's Overview</Text>
              <View className="rounded-3xl bg-[#25262B] p-4">
                <MetricsOverview />
              </View>
            </View>
          </View>
        </FadeInView>

        {/* Recent Trainings */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          className="mt-6 px-6"
        >
          <View className="mb-8">
            <Text className="mb-4 text-2xl font-bold text-white">Recent Trainings</Text>
            <View className="rounded-3xl bg-[#25262B] p-6">
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                }}
                className="mb-4 h-40 w-full rounded-xl"
                resizeMode="cover"
              />
              <Text className="text-lg font-medium text-white">Push-Pull Workout</Text>
              <Text className="text-sm text-gray-400">Completed 2 days ago</Text>
            </View>
          </View>
        </Animated.View>

        {/* Today's Meals */}
        <Animated.View 
          entering={FadeInDown.delay(500).springify()}
          className="mt-6 px-6 pb-20"
        >
          <View className="mb-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">Today's Meals</Text>
              <TouchableOpacity>
                <Text className="text-lg font-medium text-[#4ADE80]">View Plan</Text>
              </TouchableOpacity>
            </View>
            <MealPlanSection />
          </View>
        </Animated.View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}
