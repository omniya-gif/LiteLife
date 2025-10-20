import { Stack } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-[#0A1F1C]">
      {/* Gradient Circles */}
      <Animated.View 
        entering={FadeIn}
        className="absolute right-[-250px] top-[-250px] h-[500px] w-[500px] rounded-full bg-[#1A4D44]"
      />
      <Animated.View 
        entering={FadeIn.delay(100)}
        className="absolute left-[-175px] top-[-175px] h-[350px] w-[350px] rounded-full bg-[#2A5F52]"
      />
      <Animated.View 
        entering={FadeIn.delay(200)}
        className="absolute right-[-150px] top-[-100px] h-[300px] w-[300px] rounded-full bg-[#E0FF63]/20"
      />
      
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent'
          }
        }} 
      />
    </View>
  );
}