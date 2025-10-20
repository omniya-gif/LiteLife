import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Star, StarHalf } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CircularProgress } from '../../../components/CircularProgress';

const { width } = Dimensions.get('window');

export default function ProfilePage() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        <View>
          {/* Header Image */}
          <View className="h-[300px]">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80' }}
              className="absolute w-full h-full"
              resizeMode="cover"
            />
            <View className="flex-row items-center justify-between px-6 pt-4">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="h-12 w-12 items-center justify-center rounded-xl bg-black/20"
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-xl bg-white/30">
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Content */}
          <Animated.View 
            entering={FadeInDown.springify()}
            className="bg-[#1A1B1E] -mt-10 rounded-t-[36px] pt-12 px-6"
          >
            {/* Profile Image */}
            <View className="absolute -top-8 left-6">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80' }}
                className="w-[60px] h-[60px] rounded-2xl border-2 border-white"
              />
            </View>

            {/* Profile Info */}
            <Animated.View 
              entering={FadeInDown.delay(200)}
              className="flex-row items-center justify-between mt-6"
            >
              <View>
                <Text className="text-xl font-bold text-white">Amelia Sarkar</Text>
                <Text className="text-[#4ADE80] text-sm font-medium mt-1">BASIC MEMBER</Text>
              </View>
              <TouchableOpacity className="bg-[#4ADE80]/10 px-6 py-3 rounded-xl">
                <Text className="text-[#4ADE80] font-medium">Edit</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Bio */}
            <Animated.Text 
              entering={FadeInDown.delay(400)}
              className="text-gray-400 mt-6 leading-5"
            >
              I decided I was going to actively pursue a better life, and take better care of my mind, body and soul
            </Animated.Text>

            {/* Stats */}
            <Animated.View 
              entering={FadeInDown.delay(600)}
              className="flex-row justify-between mt-12"
            >
              <View>
                <Text className="text-[#4ADE80] text-xs font-medium tracking-wider">WEIGHT</Text>
                <View className="flex-row items-baseline mt-2">
                  <Text className="text-2xl font-bold text-white">58</Text>
                  <Text className="text-gray-400 ml-1">kg</Text>
                </View>
              </View>
              <View className="h-12 w-[1px] bg-[#2C2D32]" />
              <View>
                <Text className="text-[#4ADE80] text-xs font-medium tracking-wider">AGE</Text>
                <View className="flex-row items-baseline mt-2">
                  <Text className="text-2xl font-bold text-white">23</Text>
                  <Text className="text-gray-400 ml-1">yo</Text>
                </View>
              </View>
              <View className="h-12 w-[1px] bg-[#2C2D32]" />
              <View>
                <Text className="text-[#4ADE80] text-xs font-medium tracking-wider">CURRENT</Text>
                <View className="flex-row items-baseline mt-2">
                  <Text className="text-2xl font-bold text-white">176</Text>
                  <Text className="text-gray-400 ml-1">cm</Text>
                </View>
              </View>
            </Animated.View>

            {/* Activity Cards */}
            <Animated.View 
              entering={FadeInDown.delay(800)}
              className="flex-row justify-between mt-9"
            >
              {/* Steps Card */}
              <TouchableOpacity 
                onPress={() => router.push('/steps')}
                className="w-[162px] h-[216px] bg-[#4ADE80] rounded-2xl p-4"
              >
                <Text className="text-white text-xs font-medium tracking-wider">STEPS</Text>
                <View className="flex-1 items-center justify-center">
                  <View className="relative">
                    <CircularProgress 
                      size={96}
                      strokeWidth={12}
                      progress={0.4}
                      colors={['#34D399']}
                    />
                    <View className="absolute inset-0 items-center justify-center">
                      <StarHalf size={36} color="white" />
                    </View>
                  </View>
                </View>
                <View>
                  <Text className="text-2xl font-medium text-white">9,890</Text>
                  <Text className="text-white/60 text-sm">last update 3m</Text>
                </View>
              </TouchableOpacity>

              {/* Weight Card */}
              <TouchableOpacity 
                onPress={() => router.push('/weight')}
                className="w-[162px] h-[216px] bg-[#34D399] rounded-2xl p-4"
              >
                <Text className="text-white text-xs font-medium tracking-wider">WEIGHT</Text>
                <View className="flex-1 items-center justify-center">
                  <View className="h-[72px] w-full bg-white/10 rounded-xl" />
                </View>
                <View>
                  <Text className="text-2xl font-medium text-white">58 kg</Text>
                  <Text className="text-white/60 text-sm">last update 3m</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Premium Card */}
            <Animated.View 
              entering={FadeInDown.delay(1000)}
              className="mt-9 mb-6 bg-white rounded-3xl p-6"
            >
              <Text className="text-[#4ADE80] text-xs font-medium">GO PREMIUM</Text>
              <Text className="text-xl font-medium mt-2">Unlock all features to improve your health</Text>
              <Text className="text-gray-600 mt-1">Be a part of our healthy group</Text>

              {/* Member Images */}
              <View className="flex-row mt-6">
                {[1,2,3,4].map((_, i) => (
                  <Image 
                    key={i}
                    source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80' }}
                    className="w-[42px] h-[42px] rounded-xl ml-3 first:ml-0"
                  />
                ))}
              </View>

              {/* Unlock Button */}
              <TouchableOpacity 
                onPress={() => router.push('/subscription')}
                className="w-full h-[54px] bg-[#4ADE80] rounded-2xl mt-6 items-center justify-center"
              >
                <Text className="text-white font-medium">Unlock now</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}