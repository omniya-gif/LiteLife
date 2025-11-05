import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Minus, GlassWater } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInUp,
  withSpring,
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { CircularProgress } from '../../../components/CircularProgress';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

const waterCups = [
  { id: 1, amount: 0.2, label: '200ml' },
  { id: 2, amount: 0.5, label: '500ml' },
  { id: 3, amount: 1.0, label: '1L' },
];

// Add this helper function to generate wave path
const createWavePath = (width: number, amplitude: number, frequency: number, phase: number) => {
  const steps = 100;
  let path = `M 0 ${amplitude}`;
  
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = amplitude + Math.sin((i / steps) * 2 * Math.PI * frequency + phase) * (amplitude / 2);
    path += ` L ${x} ${y}`;
  }
  
  path += ` L ${width} ${amplitude * 3}`;
  path += ` L 0 ${amplitude * 3}`;
  path += ' Z';
  return path;
};

export default function WaterTrackerPage() {
  const router = useRouter();
  const theme = useTheme();
  const [waterAmount, setWaterAmount] = useState(750);
  const [selectedAmount, setSelectedAmount] = useState(0.2); // Default to 200ml
  const [goal] = useState(2500);
  const progress = waterAmount / goal;

  // Animation values
  const progressAnimation = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  // Update animation values for waves
  const wave1Offset = useSharedValue(0);
  const wave2Offset = useSharedValue(180); // Start with phase difference
  const wave3Offset = useSharedValue(90);

  React.useEffect(() => {
    wave1Offset.value = 0;
    wave2Offset.value = 0;
    
    wave1Offset.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    wave2Offset.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    progressAnimation.value = withSpring(progress, {
      damping: 15,
      stiffness: 80,
    });
  }, [progress]);

  const liquidStyle = useAnimatedStyle(() => ({
    height: `${progressAnimation.value * 100}%`,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  }));

  const wave1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: wave1Offset.value }],
  }));

  const wave2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: -wave2Offset.value }], // Notice the negative value
  }));

  const Wave1Component = React.memo(() => {
    const d = createWavePath(width * 0.6 + 200, 30, 2, wave1Offset.value);
    return (
      <Svg height={200} width={width * 0.6 + 200} style={{ position: 'absolute', top: -50 }}>
        <Path d={d} fill={`${theme.primary}66`} />
      </Svg>
    );
  });

  const Wave2Component = React.memo(() => {
    const d = createWavePath(width * 0.6 + 200, 35, 1.5, wave2Offset.value);
    return (
      <Svg height={200} width={width * 0.6 + 200} style={{ position: 'absolute', top: -30 }}>
        <Path d={d} fill={`${theme.primary}99`} />
      </Svg>
    );
  });

  const WavesContainer = React.memo(() => (
    <Animated.View style={liquidStyle}>
      <View style={{ position: 'absolute', bottom: 0, left: -50, right: -50 }}>
        <Animated.View style={wave1Style}>
          <Wave1Component />
        </Animated.View>
        <Animated.View style={wave2Style}>
          <Wave2Component />
        </Animated.View>
        <View style={{ 
          backgroundColor: `${theme.primary}CC`, 
          height: 1000,
          marginTop: 50 
        }} />
      </View>
    </Animated.View>
  ));

  const handleCupSelection = (amount) => {
    setSelectedAmount(amount);
    buttonScale.value = withSpring(1.1, {}, () => {
      buttonScale.value = withSpring(1);
    });
  };

  const addWater = () => {
    setWaterAmount((prev) => Math.min(goal, prev + selectedAmount * 1000));
  };

  const removeWater = () => {
    setWaterAmount((prev) => Math.max(0, prev - selectedAmount * 1000));
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.springify()}
        className="flex-row items-center px-6 pb-2 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="ml-4 text-lg font-medium" style={{ color: theme.primary }}>HYDRATION</Text>
      </Animated.View>

      {/* Main Content */}
      <View className="flex-1 justify-center px-6">
        {/* Water Intake Summary */}
        <Animated.View entering={FadeIn.delay(300).springify()} className="items-center">
          <Text className="text-center text-3xl font-bold text-white">
            You drank <Text style={{ color: theme.primary }}>{waterAmount}ml</Text> of{' '}
            <Text className="text-gray-400">{goal}ml</Text>
          </Text>
          <Text className="mt-2 text-gray-400">
            {progress < 0.5 ? 'Keep going!' : progress < 0.8 ? 'Almost there!' : 'Great job!'}
          </Text>
        </Animated.View>

        {/* Progress Circle with Liquid Animation */}
        <Animated.View entering={FadeInUp.delay(400).springify()} className="items-center py-8">
          <View className="relative" style={{ width: width * 0.6, height: width * 0.6 }}>
            <View className="absolute inset-0 overflow-hidden rounded-full" style={{ backgroundColor: theme.backgroundLight }}>
              <WavesContainer />
            </View>
            <CircularProgress
              size={width * 0.6}
              strokeWidth={16}
              progress={progress}
              colors={[theme.primary, theme.primary, theme.primary]}
            />
            <Animated.View
              entering={FadeIn.delay(500)}
              className="absolute inset-0 items-center justify-center">
              <Text className="text-4xl font-bold text-white">{Math.round(progress * 100)}%</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Quick Add Buttons */}
        <Animated.View entering={FadeInUp.delay(600)}>
          <Text className="mb-4 text-center text-xl font-bold text-white">Quick Add</Text>
          <View className="flex-row justify-around">
            {waterCups.map((cup) => (
              <TouchableOpacity
                key={cup.id}
                onPress={() => handleCupSelection(cup.amount)}
                className="h-16 w-16 items-center justify-center rounded-full"
                style={{ 
                  backgroundColor: selectedAmount === cup.amount ? theme.primary : theme.backgroundLight 
                }}>
                <GlassWater size={24} color="white" />
                <Text className="mt-1 text-xs text-white">{cup.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Bottom Controls */}
      <Animated.View entering={FadeInUp.delay(700)} className="px-6 pb-8 pt-4" style={{ backgroundColor: theme.background }}>
        <View className="flex-row items-center justify-between rounded-2xl p-4" style={{ backgroundColor: theme.backgroundLight }}>
          <TouchableOpacity
            onPress={removeWater}
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.backgroundDark }}>
            <Minus size={24} color={theme.primary} />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-lg text-white">Add {selectedAmount * 1000}ml</Text>
          </View>
          <TouchableOpacity
            onPress={addWater}
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.backgroundDark }}>
            <Plus size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
