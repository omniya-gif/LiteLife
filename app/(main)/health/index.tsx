import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Droplets, Scale } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Header } from '../home/components/Header';
import { TabBar } from '../home/components/TabBar';
import { BottomNavigation } from '../home/components/BottomNavigation';

const CalculatorCard = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    className="mb-4 overflow-hidden rounded-2xl bg-[#25262B] p-4 shadow-sm"
    style={{ elevation: 2 }}>
    <View className="flex-row items-center space-x-4">
      <View 
        className="items-center justify-center rounded-xl p-3"
        style={{ backgroundColor: `${color}10` }}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-white">{title}</Text>
        <Text className="text-sm text-gray-400">{description}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const calculators = [
  {
    title: 'Calorie Tracker',
    description: 'Track your daily caloric intake',
    icon: <Scale size={24} color="#FF922C" />,
    color: '#FF922C',
    route: '/calculators/calorie'
  },
  {
    title: 'Water Intake',
    description: 'Track your daily hydration',
    icon: <Droplets size={24} color="#3B82F6" />,
    color: '#3B82F6',
    route: '/calculators/water'
  },
  {
    title: 'Weight Tracker',
    description: 'Monitor your weight progress',
    icon: <Activity size={24} color="#10B981" />,
    color: '#10B981',
    route: '/calculators/weight'
  }
];

export default function HealthPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        <Header 
          title="Health" 
          imageUrl="https://images.unsplash.com/photo-1599566150163-29194dcaad36" 
        />
        <TabBar activeTab="health" />
        <View className="p-6">
          <Text className="mb-6 text-2xl font-bold text-white">Health Calculators</Text>
          {calculators.map((calc, index) => (
            <CalculatorCard 
              key={index} 
              {...calc} 
              onPress={() => router.push(calc.route)}
            />
          ))}
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}