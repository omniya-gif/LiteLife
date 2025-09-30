import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';

import { AuthInput } from '../../components/AuthInput';
import { WavyBackground } from '../../components/WavyBackground';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('mauricio@divelement.io');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const buttonScale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=2076&auto=format&fit=crop',
      }}
      className="flex-1"
      imageStyle={{ opacity: 0.15 }}>
      <View className="flex-1 bg-white/80">
        <StatusBar barStyle="dark-content" />
        <WavyBackground position="top" />

        <View className="flex-1 px-6 pt-24">
          <View className="mb-12">
            <Text className="text-5xl font-light leading-tight text-gray-800">Welcome Back!</Text>
            <Text className="text-5xl font-bold leading-tight">
              <Text className="text-[#84C94B]">Chef</Text>
              <Text className="text-[#FF6B6B]"> & </Text>
              <Text className="text-[#4ECDC4]">Fitness Pro</Text>
            </Text>
            <Text className="mt-3 text-xl text-gray-600">
              Your meals, workouts & nutrition awaits
            </Text>
          </View>

          <View className="flex-1 space-y-5">
            <AuthInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="yourname@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity className="mb-4 self-end">
              <Text className="text-lg font-semibold text-[#84C94B]">Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleLogin}
                className="items-center rounded-2xl bg-[#84C94B] py-4 shadow-lg shadow-green-200"
                disabled={isLoading}>
                {isLoading ? (
                  <View className="flex-row items-center space-x-2">
                    <ActivityIndicator color="white" />
                    <Text className="text-lg font-semibold text-white">Signing in...</Text>
                  </View>
                ) : (
                  <Text className="text-lg font-semibold text-white">Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View className="mt-auto pb-8">
              <View className="my-12 flex-row items-center">
                <View className="h-[1px] flex-1 bg-gray-300" />
                <View className="mx-4">
                  <Text className="text-lg font-medium text-gray-600">alternative ingredients</Text>
                </View>
                <View className="h-[1px] flex-1 bg-gray-300" />
              </View>

              <View className="flex-row justify-center space-x-4">
                <TouchableOpacity className="h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
                  <Image
                    source={require('../../assets/images/app-icon/google-icon.png')}
                    className="h-8 w-8"
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <TouchableOpacity className="h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
                  <Image
                    source={require('../../assets/images/app-icon/facebook.png')}
                    className="h-8 w-8"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-center pb-4">
              <Text className="text-lg text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text className="text-lg font-semibold text-[#84C94B]">Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <WavyBackground position="bottom" />
      </View>
    </ImageBackground>
  );
}
