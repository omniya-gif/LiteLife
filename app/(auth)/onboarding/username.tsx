import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useOnboardingStore } from '../../../stores/onboardingStore';

// Hard-coded green color for pages BEFORE gender selection (Steps 1-4)
const PRIMARY_COLOR = '#4ADE80';

export default function UsernamePage() {
  const router = useRouter();
  const updateFormData = useOnboardingStore(state => state.updateFormData);
  const formData = useOnboardingStore(state => state.formData);
  
  const [username, setUsername] = useState(formData.username || '');
  const [error, setError] = useState('');

  const validateUsername = (text: string) => {
    setError('');
    
    // Remove spaces and special characters except underscore and dash
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);

    if (cleaned.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (cleaned.length > 20) {
      setError('Username must be less than 20 characters');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateUsername(username) && username.length >= 3) {
      updateFormData({ username });
      router.push('/onboarding/age');
    }
  };

  const canContinue = username.length >= 3 && !error;

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          entering={FadeInDown.springify()}
          className="flex-row items-center justify-between px-6 pt-4"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="h-2 flex-1 mx-4 rounded-full bg-[#2C2D32]">
            <View className="h-2 w-[25%] rounded-full" style={{ backgroundColor: PRIMARY_COLOR }} />
          </View>
          <Text className="font-medium" style={{ color: PRIMARY_COLOR }}>STEP 2/8</Text>
        </Animated.View>

        <View className="flex-1 justify-center px-6">
          <Animated.View entering={FadeInDown.delay(200)}>
            <View 
              className="w-20 h-20 rounded-full items-center justify-center mb-8 self-center"
              style={{ backgroundColor: `${PRIMARY_COLOR}20` }}
            >
              <User size={40} color={PRIMARY_COLOR} />
            </View>

            <Text className="text-4xl font-bold text-white text-center mb-2">
              Choose a Username
            </Text>
            <Text className="text-gray-400 text-center text-base mb-12">
              This is how others will see you in the app
            </Text>

            <View className="mb-6">
              <Text className="text-white text-sm font-medium mb-3">Username</Text>
              <View 
                className="flex-row items-center rounded-2xl px-5 py-4"
                style={{ backgroundColor: '#25262B' }}
              >
                <Text className="text-gray-400 text-lg mr-2">@</Text>
                <TextInput
                  value={username}
                  onChangeText={validateUsername}
                  placeholder="yourname"
                  placeholderTextColor="#666"
                  className="flex-1 text-white text-lg"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </View>
              {error && (
                <Animated.Text 
                  entering={FadeIn}
                  className="text-red-500 text-sm mt-2 ml-2"
                >
                  {error}
                </Animated.Text>
              )}
              {username.length >= 3 && !error && (
                <Animated.Text 
                  entering={FadeIn}
                  className="text-sm mt-2 ml-2"
                  style={{ color: PRIMARY_COLOR }}
                >
                  ✓ Username available
                </Animated.Text>
              )}
            </View>

            <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: `${PRIMARY_COLOR}10` }}>
              <Text className="text-sm" style={{ color: PRIMARY_COLOR }}>
                <Text className="font-bold">Tips: </Text>
                Only lowercase letters, numbers, underscore (_) and dash (-) allowed
              </Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View 
          entering={FadeIn.delay(400)}
          className="px-6 mb-6"
        >
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canContinue}
            className="w-full h-14 rounded-2xl items-center justify-center"
            style={{ 
              backgroundColor: canContinue ? PRIMARY_COLOR : '#2C2D32',
              opacity: canContinue ? 1 : 0.5
            }}
          >
            <Text 
              className="font-semibold text-lg"
              style={{ color: canContinue ? '#1A1B1E' : '#666' }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
