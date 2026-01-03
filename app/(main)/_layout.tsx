import { Stack } from 'expo-router';
import { View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft, FadeIn, FadeOut } from 'react-native-reanimated';

import { FEATURES } from '../../config/features';
import OnboardingGuard from '../../components/auth/OnboardingGuard';
import AuthGuard from '../../components/auth/AuthGuard';

const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Main Layout - v1.0
 * 
 * Active routes:
 * - home (dashboard)
 * - health (health tracking)
 * - workouts (exercise library)
 * - calculators (BMI, BMR, TDEE, etc.)
 * - profile (user profile & settings)
 * 
 * Hidden routes (v1.1+):
 * - recipes, nutrition, favorites, journal, chat, badges, notifications
 */
export default function MainLayout() {
  return (
    <AuthGuard>
      <OnboardingGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            customAnimationOnGesture: true,
            presentation: 'card',
            contentStyle: { backgroundColor: '#F9FAFB' },
            // Add custom animations for screen transitions
            customAnimationEntering: SlideInRight,
            customAnimationExiting: SlideOutLeft,
            // Add loading screen animation
            contentComponent: ({ children }) => (
              <AnimatedView
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                style={{ flex: 1 }}>
                {children}
              </AnimatedView>
            ),
          }}>
          {/* ====== v1.0 CORE ROUTES ====== */}
          <Stack.Screen name="home" />
          <Stack.Screen name="health" />
          <Stack.Screen name="workouts" />
          <Stack.Screen name="calculators" />
          <Stack.Screen name="profile" />

          {/* ====== v1.1+ ROUTES (Hidden but preserved) ====== */}
          {FEATURES.RECIPES && <Stack.Screen name="recipes" />}
          {FEATURES.NUTRITION && <Stack.Screen name="nutrition" />}
          {FEATURES.FAVORITES && <Stack.Screen name="favorites" />}
          {FEATURES.JOURNAL && <Stack.Screen name="journal" />}
          {FEATURES.AI_CHAT && <Stack.Screen name="chat" />}
          {FEATURES.BADGES && <Stack.Screen name="badges" />}
          {FEATURES.NOTIFICATIONS && <Stack.Screen name="notifications" />}
          {FEATURES.SUBSCRIPTION && <Stack.Screen name="subscription" />}
        </Stack>
      </OnboardingGuard>
    </AuthGuard>
  );
}