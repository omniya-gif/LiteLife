import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../../../hooks/useTheme';

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onNext: () => void;
  nextLabel?: string;
  showBack?: boolean;
}

export const OnboardingLayout = ({ 
  children, 
  step, 
  totalSteps, 
  onNext, 
  nextLabel = 'Continue',
  showBack = true
}: OnboardingLayoutProps) => {
  const router = useRouter();
  const theme = useTheme();
  const progressPercent = (step / totalSteps) * 100;

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Animated.View 
        entering={FadeInDown.springify()}
        className="flex-row items-center justify-between px-6 pt-4"
      >
        {showBack && (
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        )}
        {!showBack && <View style={{ width: 24 }} />}
        
        <View className="h-2 flex-1 mx-4 rounded-full bg-[#2C2D32]">
          <View 
            className="h-2 rounded-full" 
            style={{ backgroundColor: theme.primary, width: `${progressPercent}%` }} 
          />
        </View>
        <Text className="font-medium" style={{ color: theme.primary }}>
          STEP {step}/{totalSteps}
        </Text>
      </Animated.View>

      <View className="flex-1">
        {children}
      </View>

      <Animated.View 
        entering={FadeIn.delay(700)}
        className="px-6 mb-6"
      >
        <TouchableOpacity
          onPress={onNext}
          className="w-full h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-[#1A1B1E] font-semibold text-lg">
            {nextLabel}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};
