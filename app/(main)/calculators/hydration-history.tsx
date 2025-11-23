import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronLeft, ChevronRight, Droplets } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../../hooks/useTheme';
import { useHealthConnect, readHydrationData } from '../../../hooks/useHealthConnect';
import { useUserStore } from '../../../stores/userStore';

type ViewMode = 'day' | 'week' | 'month';

interface DayData {
  date: Date;
  amount: number;
  dayName: string;
  dayNumber: number;
}

export default function HydrationHistory() {
  const router = useRouter();
  const theme = useTheme();
  const { onboarding } = useUserStore();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hydrationData, setHydrationData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekTotal, setWeekTotal] = useState(0);

  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Hydration' },
  ]);

  const waterTarget = onboarding?.water_target || 2000;

  // Get date range based on view mode
  const getDateRange = () => {
    const today = new Date(selectedDate);
    
    if (viewMode === 'day') {
      const start = new Date(today.setHours(0, 0, 0, 0));
      const end = new Date(today.setHours(23, 59, 59, 999));
      return { start, end };
    } else if (viewMode === 'week') {
      const dayOfWeek = today.getDay();
      const start = new Date(today);
      start.setDate(today.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      return { start, end };
    } else {
      const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
  };

  // Format date range display
  const getDateRangeText = () => {
    const { start, end } = getDateRange();
    
    if (viewMode === 'day') {
      return start.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else if (viewMode === 'week') {
      const startDay = start.getDate();
      const endDay = end.getDate();
      const month = start.toLocaleDateString('en-US', { month: 'long' });
      return `${startDay}–${endDay} ${month}`;
    } else {
      return start.toLocaleDateString('en-US', { 
        month: 'long',
        year: 'numeric'
      });
    }
  };

  // Fetch hydration data
  const fetchHydrationData = async () => {
    if (!healthConnect.hasPermissions) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { start, end } = getDateRange();
      
      if (viewMode === 'day') {
        const amount = await readHydrationData(start.toISOString(), end.toISOString());
        setHydrationData([{
          date: start,
          amount,
          dayName: start.toLocaleDateString('en-US', { weekday: 'long' }),
          dayNumber: start.getDate()
        }]);
        setWeekTotal(amount);
      } else if (viewMode === 'week') {
        const days: DayData[] = [];
        let total = 0;
        
        for (let i = 0; i < 7; i++) {
          const dayStart = new Date(start);
          dayStart.setDate(start.getDate() + i);
          dayStart.setHours(0, 0, 0, 0);
          
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);
          
          const amount = await readHydrationData(dayStart.toISOString(), dayEnd.toISOString());
          total += amount;
          
          days.push({
            date: dayStart,
            amount,
            dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: dayStart.getDate()
          });
        }
        
        setHydrationData(days);
        setWeekTotal(total);
      } else {
        const year = start.getFullYear();
        const month = start.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: DayData[] = [];
        let total = 0;
        
        for (let i = 1; i <= daysInMonth; i++) {
          const dayStart = new Date(year, month, i, 0, 0, 0, 0);
          const dayEnd = new Date(year, month, i, 23, 59, 59, 999);
          
          const amount = await readHydrationData(dayStart.toISOString(), dayEnd.toISOString());
          total += amount;
          
          days.push({
            date: dayStart,
            amount,
            dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: i
          });
        }
        
        setHydrationData(days);
        setWeekTotal(total);
      }
    } catch (error) {
      console.error('Error fetching hydration history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHydrationData();
  }, [viewMode, selectedDate, healthConnect.hasPermissions]);

  useFocusEffect(
    useCallback(() => {
      if (healthConnect.hasPermissions) {
        fetchHydrationData();
      }
    }, [viewMode, selectedDate, healthConnect.hasPermissions])
  );

  // Navigation handlers
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Render bar chart for week/month view
  const renderBarChart = () => {
    const maxAmount = Math.max(...hydrationData.map(d => d.amount), waterTarget);
    
    return (
      <View className="px-4 py-6">
        <View className="flex-row items-end justify-between h-48">
          {hydrationData.map((day, index) => {
            const heightPercentage = (day.amount / maxAmount) * 100;
            const barHeight = Math.max((heightPercentage / 100) * 192, 8); // 192 = h-48
            const isCurrentDay = isToday(day.date);
            const metGoal = day.amount >= waterTarget;
            
            return (
              <Animated.View 
                key={index}
                entering={FadeInDown.delay(index * 50)}
                className="items-center flex-1"
              >
                <Text className="text-white text-xs mb-2">
                  {day.amount > 0 ? `${day.amount}` : ''}
                </Text>
                <View 
                  style={{ height: barHeight }}
                  className={`w-full mx-1 rounded-t-lg ${
                    metGoal 
                      ? 'bg-green-500' 
                      : day.amount > 0 
                        ? 'bg-blue-400' 
                        : 'bg-gray-700'
                  } ${isCurrentDay ? 'opacity-100' : 'opacity-70'}`}
                />
                <Text className={`text-xs mt-2 ${isCurrentDay ? 'text-white font-bold' : 'text-gray-400'}`}>
                  {viewMode === 'month' ? day.dayNumber : day.dayName}
                </Text>
              </Animated.View>
            );
          })}
        </View>
        
        {/* Goal line */}
        <View className="absolute left-4 right-4 flex-row items-center" style={{ top: 24 }}>
          <View className="flex-1 h-px bg-green-500 opacity-30" style={{ borderStyle: 'dashed' }} />
          <Text className="text-green-500 text-xs ml-2">{waterTarget} ml</Text>
        </View>
      </View>
    );
  };

  // Render day view details
  const renderDayView = () => {
    if (hydrationData.length === 0) return null;
    
    const dayData = hydrationData[0];
    const percentage = Math.round((dayData.amount / waterTarget) * 100);
    const metGoal = dayData.amount >= waterTarget;
    
    return (
      <View className="px-6 py-8">
        <Animated.View 
          entering={FadeInDown}
          className="items-center"
        >
          <View className="w-48 h-48 rounded-full bg-blue-500/20 items-center justify-center mb-6">
            <Droplets size={80} color={metGoal ? '#10b981' : '#60a5fa'} />
          </View>
          
          <Text className="text-6xl font-bold text-white mb-2">
            {dayData.amount}
          </Text>
          <Text className="text-xl text-gray-400 mb-4">ml</Text>
          
          <View className="w-full bg-gray-800 rounded-full h-3 mb-2">
            <View 
              className={`h-3 rounded-full ${metGoal ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </View>
          
          <Text className="text-lg text-gray-300 mb-8">
            {percentage}% of {waterTarget} ml goal
          </Text>
          
          <View className="flex-row justify-around w-full">
            <View className="items-center">
              <Text className="text-3xl font-bold" style={{ color: theme.primary }}>
                {Math.round(dayData.amount / 250)}
              </Text>
              <Text className="text-gray-400 text-sm">Glasses</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-3xl font-bold" style={{ color: theme.primary }}>
                {(dayData.amount / 1000).toFixed(1)}
              </Text>
              <Text className="text-gray-400 text-sm">Liters</Text>
            </View>
            
            <View className="items-center">
              <Text className="text-3xl font-bold" style={{ color: theme.primary }}>
                {waterTarget - dayData.amount > 0 ? waterTarget - dayData.amount : 0}
              </Text>
              <Text className="text-gray-400 text-sm">ml Left</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  if (!healthConnect.isAvailable) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Hydration History</Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Droplets size={64} color="#6b7280" />
          <Text className="text-xl font-bold text-white mt-4 text-center">
            Health Connect Not Available
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            This feature requires Health Connect to be installed on your device.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!healthConnect.hasPermissions) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Hydration History</Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Droplets size={64} color="#6b7280" />
          <Text className="text-xl font-bold text-white mt-4 text-center">
            Permission Required
          </Text>
          <Text className="text-gray-400 text-center mt-2 mb-6">
            Grant permission to read your hydration data from Health Connect.
          </Text>
          <TouchableOpacity
            onPress={healthConnect.requestPermissions}
            className="px-8 py-3 rounded-xl"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white font-semibold text-lg">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Hydration</Text>
        <TouchableOpacity onPress={goToToday}>
          <Text style={{ color: theme.primary }} className="font-semibold">Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* View Mode Tabs */}
        <View className="flex-row justify-around px-4 py-4 border-b border-gray-800">
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setViewMode(mode)}
              className="px-6 py-2"
            >
              <Text
                className={`text-base font-semibold capitalize ${
                  viewMode === mode ? 'text-white' : 'text-gray-500'
                }`}
              >
                {mode}
              </Text>
              {viewMode === mode && (
                <View className="h-0.5 mt-2 rounded-full" style={{ backgroundColor: theme.primary }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Navigation */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity onPress={goToPrevious} className="p-2">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View className="items-center">
            <Text className="text-lg font-bold text-white">
              {getDateRangeText()}
            </Text>
            <Text className="text-sm" style={{ color: theme.primary }}>
              {weekTotal.toLocaleString()} mL
            </Text>
          </View>
          
          <TouchableOpacity onPress={goToNext} className="p-2">
            <ChevronRight size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : viewMode === 'day' ? (
          renderDayView()
        ) : (
          renderBarChart()
        )}

        {/* Hydration Tip */}
        <View className="mx-4 mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Text className="text-blue-400 text-sm leading-5">
            💡 Hydration is vital in keeping your body functioning. Being well hydrated can improve your mood, sleep and mental performance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
