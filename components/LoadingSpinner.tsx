import LottieView from 'lottie-react-native';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export const LoadingSpinner = () => {
  return (
    <Animated.View entering={FadeIn} className="flex-1 items-center justify-center bg-[#1A1B1E]">
      <LottieView
        source={require('../assets/lottie_animations/loading.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />
    </Animated.View>
  );
};