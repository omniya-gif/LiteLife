import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Settings } from 'lucide-react-native'; // Updated import
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from './components/BottomNavigation';
import { MealPlanSection } from './components/MealPlanSection';
import { MetricsOverview } from './components/MetricsOverview';
import { TabBar } from './components/TabBar';
import { Header } from './components/Header'; // Import the reusable header

export default function HomePage() {
  // Add unique identifiers for days
  const weekDays = [
    { id: 'mon', label: 'M' },
    { id: 'tue', label: 'T' },
    { id: 'wed', label: 'W' },
    { id: 'thu', label: 'T' },
    { id: 'fri', label: 'F' },
    { id: 'sat', label: 'S' },
    { id: 'sun', label: 'S' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Header 
        title="Hassan Mdala" 
        imageUrl="https://images.unsplash.com/photo-1599566150163-29194dcaad36" 
      />

      <TabBar activeTab="home" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          {/* Today's Overview */}
          <View className="mb-8">
            <Text className="mb-4 text-2xl font-bold text-white">Today's Overview</Text>
            <View className="rounded-3xl bg-[#25262B] p-4">
              <MetricsOverview />
            </View>
          </View>

          {/* Weekly Progress - Updated with unique keys */}
          <View className="mb-8">
            <Text className="mb-4 text-2xl font-bold text-white">Weekly Progress</Text>
            <View className="rounded-3xl bg-[#25262B] p-6">
              <View className="flex-row justify-between">
                {weekDays.map((day, index) => (
                  <View key={day.id} className="items-center">
                    <View
                      className={`mb-2 h-16 w-1.5 rounded-full ${
                        index <= 3 ? 'bg-[#4ADE80]' : 'bg-[#2C2D32]'
                      }`}
                    />
                    <Text className="text-sm font-medium text-gray-400">{day.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Trainings */}
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

          {/* Today's Meals */}
          <View className="mb-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-white">Today's Meals</Text>
              <TouchableOpacity>
                <Text className="text-lg font-medium text-[#4ADE80]">View Plan</Text>
              </TouchableOpacity>
            </View>
            <MealPlanSection />
          </View>
        </View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}
