import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function ChefTypingIndicator() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
      -1
    );

    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
        -1
      );
    }, 200);

    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
        -1
      );
    }, 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
  }));

  return (
    <View className="mb-4 flex-row justify-start">
      <View className="flex-row items-center space-x-1 rounded-2xl bg-[#2C2D32] px-4 py-3">
        <Text className="mr-2 text-sm text-white">Chef is typing</Text>
        <Animated.View style={dot1Style} className="h-2 w-2 rounded-full bg-white" />
        <Animated.View style={dot2Style} className="h-2 w-2 rounded-full bg-white" />
        <Animated.View style={dot3Style} className="h-2 w-2 rounded-full bg-white" />
      </View>
    </View>
  );
}
