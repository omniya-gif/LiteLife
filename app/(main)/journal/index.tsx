import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, BarChart2, Utensils, Plus, Trash2, Flame, Coffee, Sun } from 'lucide-react-native';
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

const { width } = Dimensions.get('window');

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU'];
const DATES = ['10', '11', '12', '13', '14'];

export default function JournalPage() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(3);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const translateX = useSharedValue(0);

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
            <View className="flex-row items-center space-x-4">
              <Image
                source={{ uri: item.image }}
                className="h-16 w-16 rounded-xl"
              />
              <View>
                <Text className="text-lg font-medium text-white">{item.name}</Text>
                <Text className="text-gray-400">{item.calories} cals</Text>
              </View>
            </View>
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

      {/* Date Selector */}
      <View className="mt-8 px-6">
        <View className="flex-row justify-between">
          {DAYS.map((day, index) => (
            <View key={day} className="items-center">
              <Text className="text-sm text-gray-400">{day}</Text>
              <TouchableOpacity
                onPress={() => setSelectedDate(index)}
                className={`mt-2 h-10 w-10 items-center justify-center rounded-full ${
                  selectedDate === index ? 'bg-white' : ''
                }`}
              >
                <Text
                  className="text-lg font-medium"
                  style={{ color: selectedDate === index ? theme.primary : 'white' }}
                >
                  {DATES[index]}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Daily Summary */}
      <View className="mt-8 flex-1 rounded-t-[32px] bg-[#25262B] px-6 pt-8">
        <View className="flex-row items-center justify-between rounded-2xl bg-[#2C2D32] p-4">
          <View className="flex-row items-center space-x-4">
            <View className="rounded-full p-3" style={{ backgroundColor: `${theme.primary}10` }}>
              <Utensils size={24} color={theme.primary} />
            </View>
            <View>
              <Text className="text-xl font-bold text-white">2158 of 2850 Cal</Text>
              <Text className="text-gray-400">Add more calories to your diet</Text>
            </View>
          </View>
          <TouchableOpacity className="rounded-full p-3" style={{ backgroundColor: `${theme.primary}10` }}>
            <BarChart2 size={24} color={theme.primary} />
          </TouchableOpacity>
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

        {/* Meal Navigation Dots */}
        <View className="flex-row justify-center space-x-2 pb-6 pt-4">
          {MEALS.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: index === currentMealIndex ? 24 : 8,
                backgroundColor: index === currentMealIndex ? theme.primary : '#9CA3AF'
              }}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}