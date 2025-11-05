import { useEffect } from 'react';
import {
  useSharedValue,
  withSpring,
  withDelay,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export interface AnimationConfig {
  delay?: number;
  translateY?: number;
  scale?: number;
  damping?: number;
  stiffness?: number;
}

export const useStaggeredAnimation = (config: AnimationConfig = {}) => {
  const { delay = 0, translateY = 30, scale = 0.95, damping = 20, stiffness = 100 } = config;

  const opacity = useSharedValue(0);
  const translateYValue = useSharedValue(translateY);
  const scaleValue = useSharedValue(scale);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping, stiffness }));
    translateYValue.value = withDelay(delay, withSpring(0, { damping, stiffness }));
    scaleValue.value = withDelay(
      delay,
      withSpring(1, { damping: damping - 5, stiffness: stiffness + 20 })
    );
  }, [delay, damping, stiffness, opacity, translateYValue, scaleValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateYValue.value }, { scale: scaleValue.value }],
  }));

  return animatedStyle;
};

export const useFloatingAnimation = (enabled: boolean = true) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (enabled) {
      translateY.value = withRepeat(withTiming(3, { duration: 2000 }), -1, true);
    }
  }, [enabled, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return animatedStyle;
};

export const usePulseAnimation = (enabled: boolean = true) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (enabled) {
      scale.value = withRepeat(withTiming(1.02, { duration: 1500 }), -1, true);
    }
  }, [enabled, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};
