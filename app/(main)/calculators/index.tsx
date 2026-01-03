import { useRouter } from 'expo-router';
import {
  Calculator,
  Scale,
  Flame,
  Droplets,
  Moon,
  Zap,
  Target,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { BottomNavigation } from '../home/components/BottomNavigation';

type CalculatorItem = {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  color: string;
};

export default function CalculatorsHub() {
  const router = useRouter();

  const calculators: CalculatorItem[] = [
    {
      id: 'bmi',
      title: 'BMI',
      description: 'Body Mass Index',
      icon: Scale,
      route: '/calculators/bmi',
      color: '#10B981',
    },
    {
      id: 'bmr',
      title: 'BMR',
      description: 'Basal Metabolic Rate',
      icon: Flame,
      route: '/calculators/bmr',
      color: '#F59E0B',
    },
    {
      id: 'tdee',
      title: 'TDEE',
      description: 'Daily Energy Expenditure',
      icon: Zap,
      route: '/calculators/tdee',
      color: '#8B5CF6',
    },
    {
      id: 'calorie',
      title: 'Calories',
      description: 'Daily calorie needs',
      icon: Target,
      route: '/calculators/calorie',
      color: '#EF4444',
    },
    {
      id: 'water',
      title: 'Water',
      description: 'Hydration calculator',
      icon: Droplets,
      route: '/calculators/water',
      color: '#3B82F6',
    },
    {
      id: 'sleep',
      title: 'Sleep',
      description: 'Optimal sleep time',
      icon: Moon,
      route: '/calculators/sleep',
      color: '#6366F1',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(600)} className="px-6 pt-4 pb-2">
        <Text className="text-3xl font-bold text-white">Tools</Text>
        <Text className="mt-1 text-base text-gray-400">Know your numbers</Text>
      </Animated.View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Calculator Grid */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)} 
          className="mt-6 flex-row flex-wrap justify-between"
        >
          {calculators.map((calc, index) => {
            const Icon = calc.icon;
            return (
              <TouchableOpacity
                key={calc.id}
                onPress={() => router.push(calc.route as any)}
                className="mb-4 rounded-2xl p-5"
                style={{ width: '48%', backgroundColor: '#1A1A1A' }}
                activeOpacity={0.8}
              >
                <View
                  className="mb-4 h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${calc.color}20` }}
                >
                  <Icon size={28} color={calc.color} />
                </View>
                <Text className="text-xl font-bold text-white">{calc.title}</Text>
                <Text className="mt-1 text-sm text-gray-500">{calc.description}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Pro Tip Card */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)} 
          className="mt-4 rounded-2xl p-5"
          style={{ backgroundColor: '#29E33C15' }}
        >
          <View className="flex-row items-center">
            <View 
              className="mr-4 h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: '#29E33C20' }}
            >
              <Calculator size={24} color="#29E33C" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-white">Pro Tip 💡</Text>
              <Text className="mt-1 text-sm text-gray-400">
                Use BMR + TDEE together to find your ideal calorie intake
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <BottomNavigation />
    </SafeAreaView>
  );
}