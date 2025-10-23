import { Stack } from 'expo-router';
import { View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft, FadeIn, FadeOut } from 'react-native-reanimated';
import OnboardingGuard from '../../components/auth/OnboardingGuard';
import AuthGuard from '../../components/auth/AuthGuard';

const AnimatedView = Animated.createAnimatedComponent(View);

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
          <Stack.Screen name="home" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="journal" />
          <Stack.Screen name="recipes" />
          <Stack.Screen name="nutrition" />
          <Stack.Screen name="workouts" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="chat" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="calculators/bmr" />
          <Stack.Screen name="calculators/tdee" />
        </Stack>
      </OnboardingGuard>
    </AuthGuard>
  );
}