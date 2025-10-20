import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2, Star } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function SubscriptionPage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        {/* Header Image */}
        <View className="items-center mt-9">
          <Image 
            source={require('../../../assets/images/app-icon/plate-icon.png')}
            className="w-36 h-36"
            resizeMode="contain"
          />
        </View>

        {/* Title Section */}
        <View className="items-center mt-12">
          <Text className="text-gray-400 text-sm font-medium">GO PREMIUM</Text>
          <Text className="text-white text-lg font-medium mt-2">Get Unlimited Access</Text>
        </View>

        {/* Features */}
        <View className="px-6 mt-9">
          <View className="flex-row items-start mb-6">
            <CheckCircle2 size={36} color="#4ADE80" />
            <Text className="flex-1 text-white ml-3 text-base">
              Access to hundreds of guided lessons and science backup programs
            </Text>
          </View>

          <View className="flex-row items-start">
            <CheckCircle2 size={36} color="#4ADE80" />
            <Text className="flex-1 text-white ml-3 text-base">
              Learn to manage feelings and thought with everyday mindfulness
            </Text>
          </View>
        </View>

        {/* Pricing Cards */}
        <View className="flex-1 justify-center px-6 mt-12">
          {/* Yearly Plan */}
          <TouchableOpacity className="w-full h-[84px] rounded-2xl border-2 border-[#4ADE80] overflow-hidden mb-4">
            <View className="flex-1 bg-[#4ADE80] px-6 justify-center">
              <Text className="text-white text-base font-semibold">$59.99</Text>
              <Text className="text-white/90 text-sm mt-1">$4.99/month, billed yearly $60</Text>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity className="w-full h-[84px] rounded-2xl bg-[#25262B] overflow-hidden">
            <View className="flex-1 px-6 justify-center">
              <Text className="text-white text-base font-semibold">$4.99</Text>
              <Text className="text-gray-400 text-sm mt-1">$4.99/month, billed monthly</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subscribe Button */}
        <View className="px-[72px] mt-12 mb-9">
          <TouchableOpacity 
            onPress={() => router.push('/verify-mobile')}
            className="w-full h-[54px] bg-[#4ADE80] rounded-2xl flex-row items-center justify-center"
          >
            <Star size={18} color="white" className="mr-2" />
            <Text className="text-white text-base">Go Premium</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}