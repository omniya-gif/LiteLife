import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { FloatingLabelInput } from '../../components/auth/FloatingLabelInput';
import { SocialLogin } from '../../components/auth/SocialLogin';
import { useAuth } from '../../hooks/useAuth';

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function SignIn() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signIn: authSignIn, signUp: authSignUp } = useAuth();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      if (isSignUp) {
        const error = await authSignUp({ email, password });
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
    <View className="flex-1 bg-gradient-to-b from-gray-900 to-black">
      {/* Background with subtle gradient */}
      <LinearGradient colors={['#1a1a1a', '#0f0f0f', '#000000']} className="absolute inset-0" />

      <View className="flex-1 px-8 pt-20">
        {!showEmailForm ? (
          <>
            {/* Logo/Icon Section */}
            <View className="mb-16 items-center">
              <View className="mb-8 h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
                <View className="h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700">
                  <View className="h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-800">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-green-400">
                      <Text className="text-2xl font-bold text-black">+</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* App Title */}
              <View className="items-center">
                <Text className="text-5xl font-bold text-white">
                  Lite<Text className="text-green-400">Life</Text>
                </Text>
                <View className="mt-2 h-1 w-24 rounded-full bg-green-400" />
              </View>
            </View>

            {/* Main Title */}
            <View className="mb-16">
              <Text className="text-center text-4xl font-bold leading-tight text-white">
                Manage Your Time,{'\n'}
                Focus on Your Work!
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="mb-8 space-y-4">
              <TouchableOpacity
                onPress={() => setShowEmailForm(true)}
                className="w-full rounded-full bg-green-400 py-5">
                <Text className="text-center text-xl font-bold text-black">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text className="text-center text-lg text-white">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social Login */}
            <View className="mb-8">
              <SocialLogin isSignUp={isSignUp} />
            </View>

            {/* Footer */}

          </>
        ) : (
          <>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => setShowEmailForm(false)}
              className="mb-8 flex-row items-center">
              <ArrowLeft size={24} color="#4ADE80" />
              <Text className="ml-2 text-lg text-green-400">Back</Text>
            </TouchableOpacity>

            {/* Form Header */}
            <Text className="mb-12 text-center text-3xl font-bold text-white">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>

            {/* Form */}
            <View className="mb-8 space-y-6">
              <FloatingLabelInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                darkMode
                placeholder="Enter your email"
              />

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
                  <Text className="font-medium text-green-400">Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className="mb-8 w-full rounded-full bg-green-400 py-5">
              <Text className="text-center text-xl font-bold text-black">
                {isLoading
                  ? isSignUp
                    ? 'Creating Account...'
                    : 'Signing In...'
                  : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            {isSignUp && (
              <Text className="text-center text-sm text-gray-400">
                By signing up you agree to our{' '}
                <Text className="text-green-400 underline">Terms of Service</Text> and{' '}
                <Text className="text-green-400 underline">Privacy Policy</Text>
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}
