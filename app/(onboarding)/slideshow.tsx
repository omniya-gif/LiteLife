import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Import SVG files as components
import Fitness1SVG from '../../assets/images/new-onboarding/fitness1.svg';
import Fitness2SVG from '../../assets/images/new-onboarding/fitness2.svg';
import BreakfastSVG from '../../assets/images/new-onboarding/undraw_breakfast_rgx5.svg';

const slides = [
  {
    id: 0,
    title: 'Explore',
    subtitle: 'Exotic Destinations',
    description: 'Embark on a virtual journey through stunning destinations worldwide.',
  },
  {
    id: 1,
    title: 'Fitness',
    subtitle: 'Your Health Journey',
    description:
      'Track your workouts, monitor progress, and achieve your fitness goals with personalized plans.',
  },
  {
    id: 2,
    title: 'Nutrition',
    subtitle: 'Healthy Eating Made Easy',
    description:
      'Discover nutritious recipes and maintain a balanced diet with our meal planning tools.',
  },
];

export default function OnboardingSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentSlideData = slides[currentSlide];

  const swipeGesture = Gesture.Pan().onEnd((event) => {
    console.log(`[OnboardingSlideshow] Swipe detected with velocity: ${event.velocityX}`);
    try {
      if (event.velocityX > 500 && currentSlide > 0) {
        handlePrevious();
      } else if (event.velocityX < -500 && currentSlide < slides.length - 1) {
        handleNext();
      }
    } catch (error) {
      console.error('[OnboardingSlideshow] Error handling swipe:', error);
    }
  });

  const handleNext = () => {
    try {
      console.log(`[OnboardingSlideshow] Moving to next slide from ${currentSlide}`);
      if (currentSlide < slides.length - 1) {
        setCurrentSlide((curr) => curr + 1);
      }
    } catch (error) {
      console.error('[OnboardingSlideshow] Error moving to next slide:', error);
    }
  };

  const handlePrevious = () => {
    try {
      console.log(`[OnboardingSlideshow] Moving to previous slide from ${currentSlide}`);
      if (currentSlide > 0) {
        setCurrentSlide((curr) => curr - 1);
      }
    } catch (error) {
      console.error('[OnboardingSlideshow] Error moving to previous slide:', error);
    }
  };

  const handleGetStarted = () => {
    try {
      console.log('[OnboardingSlideshow] Get started button pressed');
      router.push('/(auth)/signin');
    } catch (error) {
      console.error('[OnboardingSlideshow] Error navigating to sign up:', error);
    }
  };

  const handleSignIn = () => {
    try {
      console.log('[OnboardingSlideshow] Sign in button pressed');
      router.push('/(auth)/signin');
    } catch (error) {
      console.error('[OnboardingSlideshow] Error navigating to sign in:', error);
    }
  };
  return (
    <GestureDetector gesture={swipeGesture}>
      <View className="flex-1 bg-green-900">
        {/* Background with dark green gradient */}
        <LinearGradient colors={['#065f46', '#047857', '#059669']} className="absolute inset-0" />
        {/* Header with back button */}
        {currentSlide > 0 && (
          <TouchableOpacity
            onPress={handlePrevious}
            className="absolute left-4 top-12 z-10 h-10 w-10 items-center justify-center rounded-full border border-green-400/30 bg-green-900/50">
            <Text className="text-2xl text-green-400">←</Text>
          </TouchableOpacity>
        )}
        {/* Main content */}
        <View className="flex-1">
          {/* Image section - top half */}
          <View className="h-1/2 items-center justify-center px-8">
            <Animated.View
              key={`image-${currentSlide}`}
              entering={FadeInDown.delay(200).springify()}
              className="items-center">
              {/* Render SVG component based on current slide */}
              {currentSlide === 0 && (
                <View
                  style={{
                    width: 256,
                    height: 256,
                    backgroundColor: '#1a5f47',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Fitness1SVG width={200} height={200} />
                </View>
              )}
              {currentSlide === 1 && (
                <View
                  style={{
                    width: 256,
                    height: 256,
                    backgroundColor: '#1a5f47',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Fitness2SVG width={200} height={200} />
                </View>
              )}
              {currentSlide === 2 && (
                <View
                  style={{
                    width: 256,
                    height: 256,
                    backgroundColor: '#1a5f47',
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <BreakfastSVG width={200} height={200} />
                </View>
              )}
            </Animated.View>
          </View>
          {/* Content section - bottom half */}
          <View className="h-1/2 justify-center px-8">
            <Animated.View
              key={`content-${currentSlide}`}
              entering={FadeInDown.delay(400).springify()}
              className="items-center">
              {/* Title */}
              <Text className="mb-2 text-center font-['Outfit'] text-4xl font-bold text-white">
                {currentSlideData.title}
              </Text>
              {/* Subtitle */}
              {currentSlideData.subtitle && (
                <Text className="mb-4 text-center font-['Outfit'] text-2xl font-semibold text-green-400">
                  {currentSlideData.subtitle}
                </Text>
              )}
              {/* Description */}
              <Text className="mb-8 text-center font-['Manrope'] text-base leading-6 text-gray-300">
                {currentSlideData.description}
              </Text>
              {/* Buttons */}
              <Animated.View
                key={`buttons-${currentSlide}`}
                entering={FadeIn.delay(600).springify()}
                className="w-full">
                {currentSlide === slides.length - 1 ? (
                  <>
                    <TouchableOpacity
                      onPress={handleGetStarted}
                      className="mb-4 h-14 w-full items-center justify-center rounded-full bg-green-400">
                      <Text className="font-['Manrope'] text-base font-semibold text-black">
                        Get started
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSignIn}
                      className="h-14 w-full items-center justify-center rounded-full border-2 border-green-400 bg-transparent">
                      <Text className="font-['Manrope'] text-base font-medium text-green-400">
                        I already have an account
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={handleNext}
                    className="h-14 w-full items-center justify-center rounded-full bg-green-400">
                    <Text className="font-['Manrope'] text-base font-semibold text-black">
                      Next
                    </Text>
                  </TouchableOpacity>
                )}
              </Animated.View>
              {/* Page indicators */}
              <View className="mt-8 flex-row justify-center space-x-2">
                {slides.map((slide, index) => (
                  <View
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'w-8 bg-green-400' : 'w-2 bg-green-800'
                    }`}
                  />
                ))}
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}
