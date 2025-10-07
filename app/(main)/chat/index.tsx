import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, PlusCircle, MessageSquare } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withDelay,
  withSequence
} from 'react-native-reanimated';

const ActionButton = ({ icon, label, onPress }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(300, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity 
        onPress={onPress}
        className="flex-row items-center space-x-3 rounded-2xl bg-[#2C2D32] p-4 mb-4"
      >
        {icon}
        <Text className="text-lg font-medium text-white">{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ChatPage() {
  const router = useRouter();
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);

  useEffect(() => {
    titleOpacity.value = withSequence(
      withDelay(100, withSpring(1))
    );
    titleTranslateY.value = withSequence(
      withDelay(100, withSpring(0))
    );
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }]
  }));

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-[#25262B]">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">AI Chef</Text>
        </View>
      </View>

      {/* Chat Interface */}
      <ScrollView className="flex-1 px-6">
        <View className="flex-1 justify-center items-center py-12">
          <Animated.Text 
            style={titleStyle}
            className="text-3xl font-bold text-white text-center mb-12"
          >
            What can I help with?
          </Animated.Text>

          <ActionButton
            icon={<Camera size={24} color="#4ADE80" />}
            label="Analyze food with camera"
            onPress={() => {}}
          />

          <ActionButton
            icon={<PlusCircle size={24} color="#4ADE80" />}
            label="Add food to journal"
            onPress={() => router.push('/journal')}
          />

          <ActionButton
            icon={<MessageSquare size={24} color="#4ADE80" />}
            label="Ask about nutrition"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}