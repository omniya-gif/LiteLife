import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Ruler, Weight, Target, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../../hooks/useAuth';
import { useUserStore } from '../../../lib/store/userStore';
import { useTheme } from '../../../hooks/useTheme';
import { supabase } from '../../../lib/supabase';
import { Gender } from '../../../types/onboarding';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, onboarding, fetchUserData } = useUserStore();
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [gender, setGender] = useState<Gender>('male');

  useEffect(() => {
    if (profile && onboarding) {
      setUsername(profile.username || '');
      setAge(onboarding.age?.toString() || '');
      setHeight(onboarding.height?.toString() || '');
      setWeight(onboarding.current_weight?.toString() || '');
      setTargetWeight(onboarding.target_weight?.toString() || '');
      setGender(onboarding.gender || 'male');
    }
  }, [profile, onboarding]);

  const validateUsername = (text: string) => {
    // Remove spaces and special characters except underscore and dash
    const cleaned = text.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(cleaned);
    return cleaned.length >= 3 && cleaned.length <= 20;
  };

  const handleSave = async () => {
    // Validation
    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    const ageNum = parseInt(age);
    const heightNum = parseInt(height);
    const weightNum = parseFloat(weight);

    if (!ageNum || ageNum < 10 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age (10-120)');
      return;
    }

    if (!heightNum || heightNum < 100 || heightNum > 250) {
      Alert.alert('Error', 'Please enter a valid height (100-250 cm)');
      return;
    }

    if (!weightNum || weightNum < 30 || weightNum > 300) {
      Alert.alert('Error', 'Please enter a valid weight (30-300 kg)');
      return;
    }

    setIsLoading(true);

    try {
      if (!user?.id) throw new Error('User not found');

      // Update profile (username)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update onboarding data
      const updateData: any = {
        age: ageNum,
        height: heightNum,
        current_weight: weightNum,
        gender,
      };

      if (targetWeight) {
        updateData.target_weight = parseFloat(targetWeight);
      }

      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .update(updateData)
        .eq('user_id', user.id);

      if (onboardingError) throw onboardingError;

      // Refresh user data
      await fetchUserData(user.id);

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Username Section */}
          <Animated.View entering={FadeInDown.delay(100)} className="mb-6">
            <View className="mb-3 flex-row items-center">
              <User size={20} color={theme.primary} />
              <Text className="ml-2 text-base font-medium text-white">Username</Text>
            </View>
            <View
              className="flex-row items-center rounded-2xl px-4 py-4"
              style={{ backgroundColor: theme.backgroundLight }}>
              <Text className="mr-2 text-lg text-gray-400">@</Text>
              <TextInput
                value={username}
                onChangeText={validateUsername}
                placeholder="username"
                placeholderTextColor="#666"
                className="flex-1 text-lg text-white"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
              />
            </View>
            {username.length > 0 && username.length < 3 && (
              <Text className="ml-2 mt-1 text-sm text-red-500">
                Username must be at least 3 characters
              </Text>
            )}
          </Animated.View>

          {/* Age Section */}
          <Animated.View entering={FadeInDown.delay(200)} className="mb-6">
            <View className="mb-3 flex-row items-center">
              <Calendar size={20} color={theme.primary} />
              <Text className="ml-2 text-base font-medium text-white">Age</Text>
            </View>
            <View
              className="flex-row items-center rounded-2xl px-4 py-4"
              style={{ backgroundColor: theme.backgroundLight }}>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="25"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                className="flex-1 text-lg text-white"
                maxLength={3}
              />
              <Text className="text-gray-400">years</Text>
            </View>
          </Animated.View>

          {/* Height Section */}
          <Animated.View entering={FadeInDown.delay(300)} className="mb-6">
            <View className="mb-3 flex-row items-center">
              <Ruler size={20} color={theme.primary} />
              <Text className="ml-2 text-base font-medium text-white">Height</Text>
            </View>
            <View
              className="flex-row items-center rounded-2xl px-4 py-4"
              style={{ backgroundColor: theme.backgroundLight }}>
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                className="flex-1 text-lg text-white"
                maxLength={3}
              />
              <Text className="text-gray-400">cm</Text>
            </View>
          </Animated.View>

          {/* Current Weight Section */}
          <Animated.View entering={FadeInDown.delay(400)} className="mb-6">
            <View className="mb-3 flex-row items-center">
              <Weight size={20} color={theme.primary} />
              <Text className="ml-2 text-base font-medium text-white">Current Weight</Text>
            </View>
            <View
              className="flex-row items-center rounded-2xl px-4 py-4"
              style={{ backgroundColor: theme.backgroundLight }}>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="70"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                className="flex-1 text-lg text-white"
                maxLength={5}
              />
              <Text className="text-gray-400">kg</Text>
            </View>
          </Animated.View>

          {/* Target Weight Section */}
          <Animated.View entering={FadeInDown.delay(500)} className="mb-6">
            <View className="mb-3 flex-row items-center">
              <Target size={20} color={theme.primary} />
              <Text className="ml-2 text-base font-medium text-white">Target Weight</Text>
              <Text className="ml-2 text-sm text-gray-400">(Optional)</Text>
            </View>
            <View
              className="flex-row items-center rounded-2xl px-4 py-4"
              style={{ backgroundColor: theme.backgroundLight }}>
              <TextInput
                value={targetWeight}
                onChangeText={setTargetWeight}
                placeholder="65"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                className="flex-1 text-lg text-white"
                maxLength={5}
              />
              <Text className="text-gray-400">kg</Text>
            </View>
          </Animated.View>

          {/* Gender Section */}
          <Animated.View entering={FadeInDown.delay(600)} className="mb-8">
            <Text className="mb-3 text-base font-medium text-white">Gender</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setGender('male')}
                className="flex-1 rounded-2xl border-2 py-4"
                style={{
                  backgroundColor: gender === 'male' ? `${theme.primary}20` : theme.backgroundLight,
                  borderColor: gender === 'male' ? theme.primary : 'transparent',
                }}>
                <Text
                  className="text-center text-lg font-medium"
                  style={{ color: gender === 'male' ? theme.primary : '#fff' }}>
                  👨 Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGender('female')}
                className="flex-1 rounded-2xl border-2 py-4"
                style={{
                  backgroundColor:
                    gender === 'female' ? `${theme.primary}20` : theme.backgroundLight,
                  borderColor: gender === 'female' ? theme.primary : 'transparent',
                }}>
                <Text
                  className="text-center text-lg font-medium"
                  style={{ color: gender === 'female' ? theme.primary : '#fff' }}>
                  👩 Female
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(700)} className="px-6 pb-6 pt-4">
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className="h-14 w-full items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isLoading ? '#666' : theme.primary,
              opacity: isLoading ? 0.6 : 1,
            }}>
            <Text className="text-lg font-semibold text-white">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
