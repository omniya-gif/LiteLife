import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { FloatingLabelInput } from '../../components/auth/FloatingLabelInput';
import { SocialLogin } from '../../components/auth/SocialLogin';
import { useAuth } from '../../hooks/useAuth';

interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
}

export default function SignIn() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signIn: authSignIn, signUp: authSignUp } = useAuth();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      if (isSignUp) {
        const error = await authSignUp({ email, password, username });
        if (error) {
          setErrors({ [error.field || 'email']: error.message });
          return;
        }
        router.push('/onboarding/expertise');
      } else {
        const error = await authSignIn({ email, password });
        if (error) {
          setErrors({ [error.field || 'email']: error.message });
          return;
        }
        router.push('/(main)/home');
      }
    } catch (error) {
      setErrors({ email: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      {/* Background Container */}
      <View className="absolute inset-0">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920',
          }}
          className="absolute inset-0 h-full w-full opacity-25"
          blurRadius={3}
        />
        <LinearGradient
          colors={[
            'rgba(41, 84, 41, 0.99)',
            'rgba(15, 32, 15, 0.97)',
            'rgba(10, 20, 10, 0.95)'
          ]}
          locations={[0, 0.5, 1]}
          className="absolute inset-0"
        />
      </View>

      {/* Content Container */}
      <View className="flex-1">
        {/* Header Section with centered text */}
        <View className="relative h-[240px]">
          <LinearGradient
            colors={[
              'rgba(17, 224, 17, 0.99)',
              'rgba(22, 52, 22, 0.95)',
              'rgba(18, 42, 18, 0.9)',
              'transparent',
            ]}
            locations={[0, 0.3, 0.7, 1]}
            className="absolute inset-0 z-10"
          />
          {/* <Animated.View
            entering={FadeInDown.springify()}
            className="z-30 flex-1 items-center justify-center">
            <Text className="mb-2 text-center text-4xl font-bold text-[#4ADE80] drop-shadow-2xl">
              {isSignUp ? 'Welcome to' : 'Welcome back to'}
            </Text>
            <Text className="text-center text-5xl font-bold text-white drop-shadow-2xl">
              NutriFit
            </Text>
          </Animated.View> */}
        </View>

        {/* Main Content Section with lighter green background */}
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          className="flex-1 rounded-t-[32px]  px-6 backdrop-blur-lg">
          <View className="flex-1">
            {!showEmailForm ? (
              <View className="flex-1">
                {/* Form Header */}
                <Text className="mb-6 mt-8 text-center text-2xl font-bold text-white">
                  {isSignUp ? 'Sign up to get started' : 'Login to continue'}
                </Text>

                <View className="flex-1">
                  <SocialLogin isSignUp={isSignUp} />

                  <View className="my-6 w-full flex-row items-center">
                    <View className="h-[1px] flex-1 bg-[#1A1B1E]" />
                    <Text className="mx-4 text-gray-400">or</Text>
                    <View className="h-[1px] flex-1 bg-[#1A1B1E]" />
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowEmailForm(true)}
                    className="w-full rounded-full border border-[#4ADE80]/20 bg-[#162116] py-4 shadow-lg shadow-[#4ADE80]/10">
                    <Text className="text-center font-medium text-gray-300">
                      {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
                    </Text>
                  </TouchableOpacity>

                  {/* Account Toggle */}
                  <View className="mt-6">
                    <Text className="text-center text-gray-400">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </Text>
                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                      <Text className="mt-2 text-center text-[#4ADE80]">
                        {isSignUp ? 'LOG IN HERE' : 'SIGN UP'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms moved to bottom */}
                <Text className="mb-8 mt-auto text-center text-sm text-gray-400">
                  By continuing you agree to our{' '}
                  <Text className="text-[#4ADE80] underline">Terms of Service</Text> and{' '}
                  <Text className="text-[#4ADE80] underline">Privacy Policy</Text>
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                <TouchableOpacity onPress={() => setShowEmailForm(false)} className="mb-6 mt-8">
                  <Text className="text-gray-400">
                    ← Back to {isSignUp ? 'sign up' : 'login'} options
                  </Text>
                </TouchableOpacity>

                {/* Form Header */}
                <Text className="mb-8 text-center text-2xl font-bold text-white">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </Text>

                {/* Form */}
                <View className="space-y-4">
                  <FloatingLabelInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    darkMode
                    placeholder="Enter your email address"
                  />

                  {isSignUp && (
                    <FloatingLabelInput
                      label="Username"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      error={errors.username}
                      darkMode
                      placeholder="Choose a username"
                    />
                  )}

                  <FloatingLabelInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    error={errors.password}
                    darkMode
                    placeholder="Enter your password"
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4">
                        {showPassword ? (
                          <EyeOff size={20} color="#666" />
                        ) : (
                          <Eye size={20} color="#666" />
                        )}
                      </TouchableOpacity>
                    }
                  />

                  {!isSignUp && (
                    <TouchableOpacity className="self-end">
                      <Text className="text-[#4ADE80]">Forgot password?</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className="mt-8 w-full rounded-full bg-[#4ADE80] py-4">
                  <Text className="text-center text-lg font-semibold text-[#0A0A0B]">
                    {isLoading
                      ? isSignUp
                        ? 'Creating Account...'
                        : 'Signing in...'
                      : isSignUp
                        ? 'Sign up'
                        : 'Log in'}
                  </Text>
                </TouchableOpacity>

                {/* Terms at bottom */}
                {isSignUp && (
                  <Text className="mb-8 mt-auto text-center text-sm text-gray-400">
                    By signing up I accept the{' '}
                    <Text className="text-[#4ADE80] underline">terms of use</Text> and the{' '}
                    <Text className="text-[#4ADE80] underline">Privacy Policy</Text>
                  </Text>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
