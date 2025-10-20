import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInDown, 
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const FloatingLabelInput = ({ label, helperText, ...props }) => {
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
        <BlurView intensity={15} tint="dark" className="overflow-hidden rounded-2xl">
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
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

export default function SignIn() {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (activeTab === 'signin') {
      router.push('/(auth)/onboarding/expertise');
    } else {
      router.push('/(auth)/signup');
    }
  };

  return (
    <View className="flex-1">
      <BlurView intensity={80} tint="dark" className="flex-1">
        {/* Logo with new animation */}
        <Animated.View 
          entering={FadeInDown.springify().damping(11)}
          className="items-center mt-20 mb-12"
        >
          <Image
            source={require('../../assets/images/app-icon/plate-icon.png')}
            className="h-20 w-20 mb-4"
            resizeMode="contain"
          />
          <Text className="text-[#4ADE80] text-2xl font-bold tracking-wide">
            Welcome Back
          </Text>
        </Animated.View>

        {/* Auth Container with improved layout */}
        <Animated.View 
          entering={FadeIn.delay(200).springify()}
          className="flex-1 px-8"
        >
          {/* Tabs */}
          <View className="flex-row mb-8">
            <TouchableOpacity 
              onPress={() => setActiveTab('signin')}
              className="flex-1"
            >
              <Text className={`text-xl font-['Inter'] ${
                activeTab === 'signin' ? 'text-[#4ADE80] font-semibold' : 'text-gray-400'
              }`}>
                Sign In
              </Text>
              {activeTab === 'signin' && (
                <View className="h-0.5 bg-[#4ADE80] mt-2" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('signup')}
              className="flex-1"
            >
              <Text className={`text-xl font-['Inter'] ${
                activeTab === 'signup' ? 'text-[#4ADE80] font-semibold' : 'text-gray-400'
              }`}>
                Sign Up
              </Text>
              {activeTab === 'signup' && (
                <View className="h-0.5 bg-[#4ADE80] mt-2" />
              )}
            </TouchableOpacity>
          </View>

          {/* Improved Form */}
          <View>
            <FloatingLabelInput
              label="Email Address"
              helperText="Enter your email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="example@email.com"
            />

            <FloatingLabelInput
              label="Password"
              helperText="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholder="••••••••"
              rightIcon={
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  {showPassword ? (
                    <EyeOff size={22} color="#4ADE80" />
                  ) : (
                    <Eye size={22} color="#4ADE80" />
                  )}
                </TouchableOpacity>
              }
            />

            {activeTab === 'signin' && (
              <TouchableOpacity className="mb-8">
                <Text className="text-[#4ADE80] text-sm text-right">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}

            {/* Improved Button */}
            <TouchableOpacity 
              onPress={handleSignIn}
              className="mb-8"
            >
              <LinearGradient
                colors={['#4ADE80', '#22C55E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl py-4 px-6"
              >
                <Text className="text-[#1A1B1E] text-center text-lg font-bold">
                  {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Improved Social Section */}
            <View className="flex-row items-center mb-8">
              <View className="flex-1 h-[1px] bg-[#4ADE80]/20" />
              <Text className="text-[#4ADE80]/60 mx-4">or continue with</Text>
              <View className="flex-1 h-[1px] bg-[#4ADE80]/20" />
            </View>

            <View className="flex-row justify-center space-x-6">
              {['google', 'apple', 'guest'].map((provider) => (
                <TouchableOpacity 
                  key={provider}
                  className="h-14 w-14 items-center justify-center rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30"
                >
                  <Image
                    source={require('../../assets/images/app-icon/google-icon.png')}
                    className="h-6 w-6"
                    style={{ tintColor: '#4ADE80' }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </BlurView>
    </View>
  );
}