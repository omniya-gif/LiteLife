import React from 'react';
import { View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

interface SwipeableContentProps {
  children: React.ReactNode;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const SwipeableContent = ({ children, currentRoute, onNavigate }: SwipeableContentProps) => {
  const translateX = useSharedValue(0);

  const handleNavigate = (direction: 'left' | 'right') => {
    const routes = ['/(main)/health', '/(main)/home', '/(main)/recipes'];
    const currentIndex = routes.indexOf(currentRoute);
    
    if (direction === 'right' && currentIndex > 0) {
      onNavigate(routes[currentIndex - 1]);
    } else if (direction === 'left' && currentIndex < routes.length - 1) {
      onNavigate(routes[currentIndex + 1]);
    }
    
    translateX.value = withSpring(0);
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        runOnJS(handleNavigate)(direction);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle} className="flex-1">
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
