import { Stack } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AuthLayout() {
  return (
    <View className="flex-1">
      {/* Gradient Circles */}
      <Animated.View 
        entering={FadeIn}
        className="absolute right-[-250px] top-[-250px] h-[500px] w-[500px] rounded-full bg-[#7C3AED]"
      />
      <Animated.View 
        entering={FadeIn.delay(100)}
        className="absolute left-[-175px] top-[-175px] h-[350px] w-[350px] rounded-full bg-[#4263EB]"
      />
      <Animated.View 
        entering={FadeIn.delay(200)}
        className="absolute right-[-150px] top-[-100px] h-[300px] w-[300px] rounded-full bg-[#06B6D4]"
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