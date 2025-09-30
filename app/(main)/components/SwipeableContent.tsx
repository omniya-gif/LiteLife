import React from 'react';
import { View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type Route = '/(main)/health' | '/(main)/home' | '/(main)/recipes';

const routes: Route[] = ['/(main)/health', '/(main)/home', '/(main)/recipes'];

interface SwipeableContentProps {
  children: React.ReactNode;
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export const SwipeableContent = ({ children, currentRoute, onNavigate }: SwipeableContentProps) => {
  const translateX = useSharedValue(0);
  const currentIndex = routes.indexOf(currentRoute);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      'worklet';
      const velocity = event.velocityX;
      let newIndex = currentIndex;

      if (Math.abs(velocity) > 500 || Math.abs(event.translationX) > width / 3) {
        if ((velocity > 0 || event.translationX > width / 3) && currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else if ((velocity < 0 || event.translationX < -width / 3) && currentIndex < routes.length - 1) {
          newIndex = currentIndex + 1;
        }
      }

      translateX.value = withSpring(0, {
        velocity: velocity,
        stiffness: 80,
        damping: 12
      });

      if (newIndex !== currentIndex) {
        runOnJS(onNavigate)(routes[newIndex]);
      }
    });

  const mainAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [1, 0.85],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { scale }
      ]
    };
  });

  const leftPageStyle = useAnimatedStyle(() => {
    const translateXValue = interpolate(
      translateX.value,
      [0, width],
      [-width / 2, 0],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      translateX.value,
      [0, width / 4],
      [0, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      translateX.value,
      [0, width],
      [0.85, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateXValue },
        { scale }
      ],
      opacity
    };
  });

  const rightPageStyle = useAnimatedStyle(() => {
    const translateXValue = interpolate(
      translateX.value,
      [-width, 0],
      [0, width / 2],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      translateX.value,
      [-width / 4, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      translateX.value,
      [-width, 0],
      [1, 0.85],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateXValue },
        { scale }
      ],
      opacity
    };
  });

  return (
    <View className="flex-1">
      <GestureDetector gesture={panGesture}>
        <View className="flex-1">
          {/* Left Page Peek */}
          {currentIndex > 0 && (
            <Animated.View 
              className="absolute left-0 top-0 bottom-0 w-full bg-gray-50"
              style={leftPageStyle}
            >
              <View className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/5 to-transparent" />
            </Animated.View>
          )}

          {/* Right Page Peek */}
          {currentIndex < routes.length - 1 && (
            <Animated.View 
              className="absolute right-0 top-0 bottom-0 w-full bg-gray-50"
              style={rightPageStyle}
            >
              <View className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/5 to-transparent" />
            </Animated.View>
          )}

          {/* Main Content */}
          <Animated.View className="flex-1" style={mainAnimatedStyle}>
            {children}
          </Animated.View>

          {/* Swipe Progress Indicators */}
          <View className="absolute bottom-20 left-0 right-0 flex-row justify-center space-x-2">
            {routes.map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-6 bg-[#FF922C]' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};