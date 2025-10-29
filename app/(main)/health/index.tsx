import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, Droplets, Scale, Scale3D, Flame, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Header } from '../../../components/home/Header';
import { TabBar } from '../home/components/TabBar';
import { BottomNavigation } from '../home/components/BottomNavigation';

const CalculatorCard = ({ title, description, icon, color, onPress, index }) => (
  <Animated.View 
    entering={FadeInUp.delay(index * 200)}
  >
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
  </Animated.View>
);

const calculators = [
  {
    title: 'Sleep Tracker',
    description: 'Monitor your sleep patterns',
    icon: <Moon size={24} color="#4ADE80" />,
    color: '#4ADE80',
    route: '/calculators/sleep'
  },
  {
    title: 'Steps Tracker',
    description: 'Track your daily steps and activity',
    icon: <Activity size={24} color="#7165E3" />,
    color: '#7165E3',
    route: '/calculators/steps'
  },
  {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index',
    icon: <Scale3D size={24} color="#4ADE80" />,
    color: '#4ADE80',
    route: '/calculators/bmi'
  },
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
  },
  {
    title: 'BMR Calculator',
    description: 'Calculate your Basal Metabolic Rate',
    icon: <Flame size={24} color="#F43F5E" />,
    color: '#F43F5E',
    route: '/calculators/bmr'
  },
  {
    title: 'TDEE Calculator',
    description: 'Calculate your Total Daily Energy Expenditure',
    icon: <Activity size={24} color="#A78BFA" />,
    color: '#A78BFA',
    route: '/calculators/tdee'
  }
];

export default function HealthPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        <Animated.View entering={FadeInDown.springify()}>
          <Header 
            title="Health" 
            imageUrl="https://images.unsplash.com/photo-1599566150163-29194dcaad36" 
          />
        </Animated.View>
        <TabBar activeTab="health" />
        <View className="p-6">
          <Animated.Text 
            entering={FadeInDown.delay(200)} 
            className="mb-6 text-2xl font-bold text-white"
          >
            Health Calculators
          </Animated.Text>
          {calculators.map((calc, index) => (
            <CalculatorCard 
              key={index}
              {...calc}
              index={index}
              onPress={() => router.push(calc.route)}
            />
          ))}
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}