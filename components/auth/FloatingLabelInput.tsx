import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

interface FloatingLabelInputProps {
  label: string;
  helperText: string;
  value: string;
  onChangeText: (text: string) => void;
  rightIcon?: React.ReactNode;
  error?: string;
  [key: string]: any;
}

export const FloatingLabelInput = ({ 
  label, 
  helperText, 
  rightIcon,
  error,
  ...props 
}: FloatingLabelInputProps) => {
  const labelAnim = useSharedValue(props.value ? 1 : 0);
  const inputRef = useRef(null);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(labelAnim.value, [0, 1], [0, -25]) },
      { scale: interpolate(labelAnim.value, [0, 1], [1, 0.85]) }
    ],
    color: interpolate(labelAnim.value, [0, 1], [0.6, 1]),
  }));

  return (
    <View className="mb-6">
      <Text className="text-[#4ADE80]/80 text-sm mb-2 ml-1">{helperText}</Text>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => inputRef.current?.focus()}
      >
        <BlurView intensity={15} tint="dark" className={`overflow-hidden rounded-2xl ${error ? 'border border-red-500' : ''}`}>
          <LinearGradient
            colors={['rgba(74, 222, 128, 0.1)', 'rgba(26, 77, 68, 0.1)']}
            className="px-5 py-4"
          >
            <Animated.Text 
              className="text-[#4ADE80] text-sm absolute left-5"
              style={labelStyle}
            >
              {label}
            </Animated.Text>
            <TextInput
              ref={inputRef}
              {...props}
              onFocus={() => labelAnim.value = withSpring(1)}
              onBlur={() => !props.value && (labelAnim.value = withSpring(0))}
              className="text-white text-lg font-medium pt-2"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            {rightIcon}
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
      {error && (
        <Text className="text-red-500 text-sm mt-2 ml-1">{error}</Text>
      )}
    </View>
  );
};