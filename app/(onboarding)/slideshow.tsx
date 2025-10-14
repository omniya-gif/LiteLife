import { router } from 'expo-router';
import { Dumbbell, LineChart, Utensils, BookOpen, ChefHat, Calendar, Bell, Target } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const FeatureItem = ({ icon, title, description, color }) => (
  <View className="mb-4 flex-row items-center space-x-4">
    <View
      className="h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: color }}>
      {icon}
    </View>
    <View className="flex-1">
      <Text className="font-['Outfit'] text-lg font-bold text-white">{title}</Text>
      <Text className="font-['Manrope'] text-sm text-[#E0E0E0]">{description}</Text>
    </View>
  </View>
);

const slides = [
  {
    id: 0,
    title: "Transform Your Life",
    description: "Track your nutrition, workouts, and wellness journey all in one place. Get personalized plans and reach your goals faster.",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&h=500",
    features: [
      {
        icon: <Dumbbell size={24} color="white" />,
        title: "Smart Meal Planning",
        description: "Personalized nutrition recommendations based on your goals",
        color: "#2797FF"
      },
      {
        icon: <Dumbbell size={24} color="white" />,
        title: "Workout Tracking",
        description: "Custom exercise routines and progress monitoring",
        color: "#0B67BC"
      },
      {
        icon: <LineChart size={24} color="white" />,
        title: "Progress Analytics",
        description: "Detailed insights and achievement tracking",
        color: "#ACC420"
      }
    ]
  },
  {
    id: 1,
    title: "Discover Amazing Recipes",
    description: "Access thousands of delicious recipes and learn to cook like a pro with step-by-step instructions.",
    image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=500",
    features: [
      {
        icon: <Utensils size={24} color="white" />,
        title: "Diverse Recipes",
        description: "Explore cuisine from around the world",
        color: "#FF6B6B"
      },
      {
        icon: <BookOpen size={24} color="white" />,
        title: "Step-by-Step Guide",
        description: "Detailed instructions for perfect results",
        color: "#4ECDC4"
      },
      {
        icon: <ChefHat size={24} color="white" />,
        title: "Cooking Tips",
        description: "Learn professional cooking techniques",
        color: "#45B7D1"
      }
    ]
  },
  {
    id: 2,
    title: "Track Your Progress",
    description: "Set your goals, track your meals, and monitor your daily nutrition intake with ease.",
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=500&h=500",
    features: [
      {
        icon: <Calendar size={24} color="white" />,
        title: "Meal Calendar",
        description: "Plan and track your meals weekly",
        color: "#FF8C42"
      },
      {
        icon: <Bell size={24} color="white" />,
        title: "Smart Reminders",
        description: "Never miss your meal times",
        color: "#6C63FF"
      },
      {
        icon: <Target size={24} color="white" />,
        title: "Goal Setting",
        description: "Track and achieve your nutrition goals",
        color: "#4CAF50"
      }
    ]
  }
];

export default function OnboardingSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentSlideData = slides[currentSlide];

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.velocityX > 500 && currentSlide > 0) {
        handlePrevious();
      } else if (event.velocityX < -500 && currentSlide < slides.length - 1) {
        handleNext();
      }
    });

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(curr => curr - 1);
    }
  };

  return (
    <GestureDetector gesture={swipeGesture}>
      <ImageBackground
        source={{ uri: currentSlideData.image }}
        className="flex-1">
        <View className="flex-1 bg-black/50">
          {currentSlide > 0 && (
            <TouchableOpacity
              onPress={handlePrevious}
              className="absolute left-4 top-12 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Text className="text-2xl text-white">←</Text>
            </TouchableOpacity>
          )}
          
          <View className="flex-1 justify-end px-6 pb-6">
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Text className="mb-4 font-['Outfit'] text-[36px] font-bold text-white">
                {currentSlideData.title}
              </Text>
              <Text className="mb-6 font-['Outfit'] text-[24px] font-bold text-[#E0E0E0]">
                {currentSlideData.description}
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              className="mb-6 rounded-2xl bg-white/20 p-6">
              {currentSlideData.features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                />
              ))}
            </Animated.View>

            <Animated.View entering={FadeIn.delay(600).springify()}>
              {currentSlide === slides.length - 1 ? (
                <>
                  <TouchableOpacity
                    onPress={() => router.push('/signup')}
                    className="mb-4 h-14 items-center justify-center rounded-full bg-[#2797FF]">
                    <Text className="font-['Manrope'] text-base font-medium text-white">Get Started</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/signin')}
                    className="h-14 items-center justify-center rounded-full bg-white/20">
                    <Text className="font-['Manrope'] text-base font-medium text-white">
                      I already have an account
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={handleNext}
                  className="h-14 items-center justify-center rounded-full bg-[#2797FF]">
                  <Text className="font-['Manrope'] text-base font-medium text-white">Next</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            <View className="mt-6 flex-row justify-center space-x-2">
              {slides.map((slide, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'w-6 bg-[#2797FF]' : 'w-2 bg-gray-400'
                  }`}
                />
              ))}
            </View>
          </View>
        </View>
      </ImageBackground>
    </GestureDetector>
  );
}
