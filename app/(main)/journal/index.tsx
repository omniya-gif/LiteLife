import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Dimensions, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, BarChart2, Utensils, Plus, Trash2, Flame, Coffee, Sun, ChevronLeft, ChevronRight, TrendingUp, Calendar } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '../../../hooks/useTheme';
import { useHealthConnect, readNutritionData } from '../../../hooks/useHealthConnect';
import { useHealthConnectWrite } from '../../../hooks/useHealthConnectWrite';
import { useUserStore } from '../../../stores/userStore';

const { width } = Dimensions.get('window');

// Generate calendar dates dynamically
const generateCalendarDays = (baseDate: Date) => {
  const days = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    days.push({
      dayName: dayNames[date.getDay()],
      date: date.getDate(),
      fullDate: date,
      isToday: i === 0
    });
  }
  return days;
};

export default function JournalPage() {
  const router = useRouter();
  const theme = useTheme();
  const { onboarding } = useUserStore();
  const [baseDate, setBaseDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState(generateCalendarDays(new Date()));
  const [selectedDateIndex, setSelectedDateIndex] = useState(3); // Middle day (today)
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [dailyCalories, setDailyCalories] = useState<number>(0);
  const [isLoadingCalories, setIsLoadingCalories] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const translateX = useSharedValue(0);

  // Health Connect integration
  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'write', recordType: 'Nutrition' },
    { accessType: 'read', recordType: 'Nutrition' },
  ]);

  const { writeMealToHealthConnect, isWriting } = useHealthConnectWrite();

  // Fetch nutrition data for selected date
  useEffect(() => {
    const fetchDailyCalories = async () => {
      if (!healthConnect.hasPermissions) return;

      setIsLoadingCalories(true);
      try {
        const selectedDay = calendarDays[selectedDateIndex];
        const startOfDay = new Date(selectedDay.fullDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDay.fullDate);
        endOfDay.setHours(23, 59, 59, 999);

        const calories = await readNutritionData(
          startOfDay.toISOString(),
          endOfDay.toISOString()
        );
        setDailyCalories(calories);
      } catch (error) {
        console.error('Error fetching daily calories:', error);
      } finally {
        setIsLoadingCalories(false);
      }
    };

    fetchDailyCalories();
  }, [selectedDateIndex, calendarDays, healthConnect.hasPermissions]);

  // Update calendar when base date changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays(baseDate));
  }, [baseDate]);

  const handlePreviousWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() - 7);
    setBaseDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + 7);
    setBaseDate(newDate);
  };

  const MEALS = [
    {
      id: 'breakfast',
      title: 'BREAKFAST',
      icon: <Coffee size={24} color={theme.primary} />,
      calories: 131,
      maxCalories: 450,
      items: [
        {
          name: "Salad with wheat and white egg",
          calories: 200,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
        },
        {
          name: "7 Nutrition Tips to Lose Weight Faster",
          calories: 200,
          image: "https://images.unsplash.com/photo-1547592166-23ac45744acd"
        }
      ]
    },
    {
      id: 'lunch',
      title: 'LUNCH',
      icon: <Sun size={24} color={theme.primary} />,
      calories: 450,
      maxCalories: 850,
      items: [
        {
          name: "Grilled Chicken Salad",
          calories: 450,
          image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f"
        }
      ]
    },
    {
      id: 'dinner',
      title: 'DINNER',
      icon: <Flame size={24} color={theme.primary} />,
      calories: 320,
      maxCalories: 550,
      items: [
        {
          name: "Salmon with Vegetables",
          calories: 320,
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288"
        }
      ]
    }
  ];

  const handleSaveMealToHealthConnect = async (mealItem: any, mealType: string) => {
    // Check if Health Connect permissions are granted
    if (!healthConnect.hasPermissions) {
      Alert.alert(
        'Health Connect Permission Required',
        'Enable Health Connect to sync your meals with Google Fit',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Grant Permission',
            onPress: async () => {
              const granted = await healthConnect.requestHealthPermissions();
              if (granted) {
                // Try saving again after permission granted
                await handleSaveMealToHealthConnect(mealItem, mealType);
              }
            },
          },
        ]
      );
      return;
    }

    const success = await writeMealToHealthConnect({
      name: mealItem.name,
      calories: mealItem.calories,
      mealType: mealType.toLowerCase(),
      timestamp: new Date().toISOString(),
    });

    if (success) {
      Alert.alert('✅ Success', 'Meal saved to Health Connect and will appear in Google Fit!');
    } else {
      Alert.alert('Error', 'Failed to save meal to Health Connect');
    }
  };

  const MealSection = ({ meal }) => {
    return (
      <View className="mt-4 w-full">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            {meal.icon}
            <Text className="text-xl font-bold" style={{ color: theme.primary }}>{meal.title}</Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <Text className="text-lg text-gray-400">{meal.calories}kcal/{meal.maxCalories} kcal</Text>
            <TouchableOpacity className="ml-2 rounded-full p-2" style={{ backgroundColor: `${theme.primary}10` }}>
              <Plus size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {meal.items.map((item, index) => (
          <View key={index} className="mt-4 flex-row items-center justify-between border-b border-[#2C2D32] pb-4">
            <TouchableOpacity 
              className="flex-row flex-1 items-center space-x-4"
              onPress={() => handleSaveMealToHealthConnect(item, meal.title)}
              disabled={isWriting}
            >
              <Image
                source={{ uri: item.image }}
                className="h-16 w-16 rounded-xl"
              />
              <View className="flex-1">
                <Text className="text-lg font-medium text-white">{item.name}</Text>
                <Text className="text-gray-400">{item.calories} cals</Text>
                <Text className="text-xs mt-1" style={{ color: theme.primary }}>
                  {isWriting ? 'Syncing...' : 'Tap to sync to Google Fit'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-full bg-[#2C2D32] p-2">
              <Trash2 size={20} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentMealIndex < MEALS.length - 1) {
      setCurrentMealIndex(prev => prev + 1);
    } else if (direction === 'right' && currentMealIndex > 0) {
      setCurrentMealIndex(prev => prev - 1);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldSwipe = Math.abs(event.velocityX) > 500 || Math.abs(event.translationX) > width / 3;
      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        runOnJS(handleSwipe)(direction);
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, width / 2],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: translateX.value }],
      opacity,
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Meal Planner</Text>
        <TouchableOpacity>
          <MoreVertical size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Date Selector with Navigation */}
      <View className="mt-8 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            onPress={handlePreviousWeek}
            className="rounded-full p-2"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <ChevronLeft size={20} color={theme.primary} />
          </TouchableOpacity>
          
          <Text className="text-lg font-semibold text-white">
            {baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity 
            onPress={handleNextWeek}
            className="rounded-full p-2"
            style={{ backgroundColor: `${theme.primary}15` }}
          >
            <ChevronRight size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {calendarDays.map((day, index) => (
            <View key={`${day.fullDate.toISOString()}-${index}`} className="items-center mx-2">
              <Text className="text-sm text-gray-400 mb-2">{day.dayName}</Text>
              <TouchableOpacity
                onPress={() => setSelectedDateIndex(index)}
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  selectedDateIndex === index 
                    ? day.isToday 
                      ? 'border-2' 
                      : ''
                    : ''
                }`}
                style={{
                  backgroundColor: selectedDateIndex === index 
                    ? day.isToday 
                      ? theme.primary 
                      : 'white'
                    : day.isToday
                      ? `${theme.primary}20`
                      : 'transparent',
                  borderColor: selectedDateIndex === index && day.isToday ? 'white' : 'transparent'
                }}
              >
                <Text
                  className="text-lg font-semibold"
                  style={{ 
                    color: selectedDateIndex === index 
                      ? day.isToday 
                        ? 'white' 
                        : theme.primary
                      : 'white' 
                  }}
                >
                  {day.date}
                </Text>
              </TouchableOpacity>
              {/* Indicator dot for days with data */}
              {!day.isToday && (
                <View 
                  className="mt-1 h-1 w-1 rounded-full" 
                  style={{ backgroundColor: theme.primary, opacity: 0.5 }} 
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Daily Summary */}
      <View className="mt-8 flex-1 rounded-t-[32px] bg-[#25262B] px-6 pt-8">
        {/* Enhanced Daily Nutrition Card */}
        <View className="rounded-3xl overflow-hidden" style={{ backgroundColor: `${theme.primary}08` }}>
          <View className="p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center space-x-3">
                <View 
                  className="rounded-2xl p-3" 
                  style={{ backgroundColor: theme.primary }}
                >
                  <Utensils size={26} color="white" />
                </View>
                <View>
                  <Text className="text-sm text-gray-400">
                    {calendarDays[selectedDateIndex].isToday ? 'Today' : 
                     calendarDays[selectedDateIndex].fullDate.toLocaleDateString('en-US', { 
                       weekday: 'long', 
                       month: 'short', 
                       day: 'numeric' 
                     })}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Nutrition Summary</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="rounded-xl p-2" 
                style={{ backgroundColor: `${theme.primary}15` }}
                onPress={() => setShowStatsModal(true)}
              >
                <BarChart2 size={22} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* Calories Display */}
            <View className="mt-2">
              {isLoadingCalories ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              ) : (
                <>
                  <View className="flex-row items-end">
                    <Text 
                      className="text-4xl font-bold" 
                      style={{ color: theme.primary }}
                    >
                      {dailyCalories}
                    </Text>
                    <Text className="text-xl font-semibold text-gray-400 ml-2 mb-1">
                      / {onboarding?.daily_calories || 2850}
                    </Text>
                    <Text className="text-lg text-gray-500 ml-1 mb-1">Cal</Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="mt-4 h-3 rounded-full bg-[#2C2D32] overflow-hidden">
                    <View 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${Math.min((dailyCalories / (onboarding?.daily_calories || 2850)) * 100, 100)}%`,
                        backgroundColor: theme.primary
                      }}
                    />
                  </View>

                  {/* Status Text */}
                  <Text className="text-sm text-gray-400 mt-3">
                    {dailyCalories < (onboarding?.daily_calories || 2850) 
                      ? `${(onboarding?.daily_calories || 2850) - dailyCalories} calories remaining to reach your goal`
                      : '🎉 Daily calorie goal achieved!'}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Quick Stats Row */}
          <View className="flex-row border-t" style={{ borderTopColor: `${theme.primary}15` }}>
            <View className="flex-1 items-center py-4 border-r" style={{ borderRightColor: `${theme.primary}15` }}>
              <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
                {Math.round((dailyCalories / (onboarding?.daily_calories || 2850)) * 100)}%
              </Text>
              <Text className="text-xs text-gray-500 mt-1">of Goal</Text>
            </View>
            <View className="flex-1 items-center py-4 border-r" style={{ borderRightColor: `${theme.primary}15` }}>
              <Text className="text-2xl font-bold text-white">{MEALS.length}</Text>
              <Text className="text-xs text-gray-500 mt-1">Meals</Text>
            </View>
            <View className="flex-1 items-center py-4">
              <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
                {MEALS.reduce((sum, meal) => sum + meal.calories, 0)}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Planned</Text>
            </View>
          </View>
        </View>

        {/* Swipeable Meal Content */}
        <GestureDetector gesture={panGesture}>
          <Animated.View 
            className="flex-1 pt-6"
            style={animatedStyle}
          >
            <MealSection meal={MEALS[currentMealIndex]} />
          </Animated.View>
        </GestureDetector>

        {/* Meal Navigation Pills */}
        <View className="flex-row justify-center space-x-2 pb-6 pt-4">
          {MEALS.map((meal, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentMealIndex(index)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: index === currentMealIndex ? 32 : 8,
                backgroundColor: index === currentMealIndex ? theme.primary : '#4B5563'
              }}
            />
          ))}
        </View>
      </View>

      {/* Detailed Stats Modal - Google Fit Style */}
      <Modal
        visible={showStatsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View className="flex-1 bg-black/70">
          <View className="flex-1 mt-20 rounded-t-[32px] bg-[#1A1B1E]">
            <View className="p-6 border-b border-[#2C2D32]">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-white">Nutrition Details</Text>
                <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                  <Text className="text-lg" style={{ color: theme.primary }}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1 p-6">
              {/* Week View Chart */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-white mb-4">Weekly Overview</Text>
                <View className="flex-row items-end justify-between h-40 px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const height = Math.random() * 100 + 20; // Mock data
                    return (
                      <View key={day} className="items-center flex-1 mx-1">
                        <View 
                          className="w-full rounded-t-lg"
                          style={{ 
                            height: `${height}%`,
                            backgroundColor: day === 'Sun' ? theme.primary : `${theme.primary}40`
                          }}
                        />
                        <Text className="text-xs text-gray-400 mt-2">{day}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Daily Breakdown */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-white mb-4">
                  {calendarDays[selectedDateIndex].fullDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>

                {/* Calories Card */}
                <View className="rounded-2xl bg-[#25262B] p-5 mb-4">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center space-x-3">
                      <View className="rounded-full p-2" style={{ backgroundColor: `${theme.primary}20` }}>
                        <Flame size={24} color={theme.primary} />
                      </View>
                      <View>
                        <Text className="text-xl font-bold text-white">{dailyCalories} Cal</Text>
                        <Text className="text-sm text-gray-400">Calories consumed</Text>
                      </View>
                    </View>
                    <TrendingUp size={24} color={theme.primary} />
                  </View>
                  
                  <View className="h-2 rounded-full bg-[#2C2D32] overflow-hidden">
                    <View 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${Math.min((dailyCalories / (onboarding?.daily_calories || 2850)) * 100, 100)}%`,
                        backgroundColor: theme.primary
                      }}
                    />
                  </View>
                </View>

                {/* Meal Breakdown */}
                <View className="space-y-3">
                  {MEALS.map((meal, index) => (
                    <View 
                      key={meal.id}
                      className="rounded-2xl bg-[#25262B] p-4"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-3">
                          <View className="rounded-full p-2" style={{ backgroundColor: `${theme.primary}15` }}>
                            {meal.icon}
                          </View>
                          <View>
                            <Text className="text-base font-semibold text-white">{meal.title}</Text>
                            <Text className="text-sm text-gray-400">{meal.items.length} items</Text>
                          </View>
                        </View>
                        <Text className="text-lg font-bold" style={{ color: theme.primary }}>
                          {meal.calories} cal
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tips Section */}
              <View className="rounded-2xl bg-[#25262B] p-5 mb-6">
                <View className="flex-row items-center space-x-2 mb-3">
                  <Calendar size={20} color={theme.primary} />
                  <Text className="text-base font-semibold text-white">Nutrition Tip</Text>
                </View>
                <Text className="text-sm text-gray-400 leading-6">
                  {dailyCalories < (onboarding?.daily_calories || 2850) * 0.8
                    ? "You're below your target! Try adding healthy snacks like nuts or fruits between meals."
                    : dailyCalories > (onboarding?.daily_calories || 2850)
                    ? "You've exceeded your goal. Consider lighter meals tomorrow to balance it out."
                    : "Great job! You're right on track with your nutrition goals. 🎉"}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}