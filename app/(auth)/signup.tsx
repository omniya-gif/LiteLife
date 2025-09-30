import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, Animated, ActivityIndicator, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { WavyBackground } from '../../components/WavyBackground';
import { AuthInput } from '../../components/AuthInput';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSignUp = async () => {
    setIsLoading(true);
    // Add your signup logic here
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=2067&auto=format&fit=crop' }}
      className="flex-1"
      imageStyle={{ opacity: 0.15 }}
    >
      <View className="flex-1 bg-white/80">
        <StatusBar barStyle="dark-content" />
        <WavyBackground position="top" />
        
        <View className="flex-1 px-6 pt-24">
          <View className="mb-12">
            <Text className="text-5xl font-light leading-tight text-gray-800">Join The Club!</Text>
            <Text className="text-5xl font-bold leading-tight">
              <Text className="text-[#84C94B]">Eat.</Text>
              <Text className="text-[#FF6B6B]"> Train.</Text>
              <Text className="text-[#4ECDC4]"> Live.</Text>
            </Text>
            <Text className="mt-3 text-xl text-gray-600">Your complete wellness journey starts here</Text>
          </View>

          <View className="space-y-5 flex-1">
            <AuthInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />

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
              placeholder="Create a strong password"
              icon={showPassword ? "eye-off-outline" : "eye-outline"}
              onIconPress={() => setShowPassword(!showPassword)}
            />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleSignUp}
                className="bg-[#84C94B] rounded-2xl py-4 items-center shadow-lg shadow-green-200 mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <View className="flex-row items-center space-x-2">
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-semibold text-lg">Creating account...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-lg">Create Account</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View className="mt-auto pb-8">
              <View className="flex-row items-center mb-8">
                <View className="flex-1 h-[1px] bg-gray-300" />
                <View className="mx-4">
                  <Text className="text-gray-600 text-lg font-medium">quick recipe for signing up</Text>
                </View>
                <View className="flex-1 h-[1px] bg-gray-300" />
              </View>

              <View className="flex-row justify-center space-x-12 mb-8">
                <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-md">
                  <Image 
                    source={require('../../assets/images/app-icon/google-icon.png')}
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity className="w-14 h-14 bg-white rounded-full items-center justify-center shadow-md">
                  <Image 
                    source={require('../../assets/images/app-icon/facebook.png')}
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-center">
                <Text className="text-gray-600 text-lg">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/signin')}>
                  <Text className="text-[#84C94B] font-semibold text-lg">Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        
        <WavyBackground position="bottom" />
      </View>
    </ImageBackground>
  );
}