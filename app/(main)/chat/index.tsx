import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChefTypingIndicator from '../../../components/chat/ChefTypingIndicator';
import MessageBubble from '../../../components/chat/MessageBubble';
import MessageInput from '../../../components/chat/MessageInput';
import { analyzeImage, getChatResponse } from '../../../lib/openaiApi';
import { useChatStore } from '../../../store/chatStore';

export default function ChatPage() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, addImage, clearChat } = useChatStore();

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        text: "👋 Hi! I'm your personal chef assistant. I can help you with recipes, cooking tips, and food analysis. What would you like to know?",
        sender: 'chef',
        timestamp: new Date(),
      });
    }
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  const handleSendMessage = async (message: string) => {
    addMessage({
      text: message,
      sender: 'user',
      timestamp: new Date(),
    });

    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await getChatResponse(message);

      addMessage({
        text:
          response || "I apologize, but I'm having trouble responding right now. Please try again.",
        sender: 'chef',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        sender: 'chef',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageAnalysis = async (base64Image: string) => {
    setIsLoading(true);
    const image = addImage('data:image/jpeg;base64,' + base64Image, base64Image);

    addMessage({
      text: '',
      sender: 'user',
      timestamp: new Date(),
      image,
    });

    try {
      const analysis = await analyzeImage(base64Image, 'conversation');

      const chefMessage = {
        text: `I see you've shared an image of ${analysis}. Would you like me to analyze its nutritional content, provide health insights, or suggest similar recipes?`,
        sender: 'chef' as const,
        timestamp: new Date(),
        onSuggestionSelect: handleSuggestionSelect,
      };

      addMessage(chefMessage);
    } catch {
      addMessage({
        text: "I'm sorry, I couldn't process your image at the moment. Please try again.",
        sender: 'chef',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = async (type: 'calories' | 'health' | 'recipes') => {
    const lastImage = messages
      .slice()
      .reverse()
      .find((msg) => msg.image)?.image;

    if (!lastImage?.base64) return;

    setIsLoading(true);
    scrollToBottom();

    try {
      if (type === 'recipes') {
        // For recipes, we would need a recipe search API
        addMessage({
          text: 'Recipe suggestions are coming soon! For now, try asking me about the nutritional content or health benefits.',
          sender: 'chef',
          timestamp: new Date(),
        });
        return;
      }

      const analysis = await analyzeImage(lastImage.base64, type);
      const message: any = {
        text: analysis,
        sender: 'chef',
        timestamp: new Date(),
        type,
      };

      if (type === 'calories') {
        const calorieMatch = analysis?.match(/(\d+)-(\d+)\s*calories/);
        const totalCalories = calorieMatch
          ? Math.floor((parseInt(calorieMatch[1], 10) + parseInt(calorieMatch[2], 10)) / 2)
          : 0;

        message.metadata = {
          nutritionalInfo: {
            protein: `${Math.floor((totalCalories * 0.2) / 4)}g`,
            carbs: `${Math.floor((totalCalories * 0.5) / 4)}g`,
            fats: `${Math.floor((totalCalories * 0.3) / 9)}g`,
            glucoseImpact: totalCalories > 500 ? 'high' : totalCalories > 300 ? 'medium' : 'low',
          },
        };
      }

      addMessage(message);
    } catch {
      addMessage({
        text: "I'm sorry, I couldn't process your request at the moment. Please try again.",
        sender: 'chef',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-[#25262B] px-6 pb-6 pt-4">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">AI Chef</Text>
        </View>
        <TouchableOpacity onPress={clearChat}>
          <Trash2 size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView ref={scrollViewRef} className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.id || index}`}
              {...message}
              onSuggestionSelect={handleSuggestionSelect}
              isNewMessage={index === messages.length - 1}
            />
          ))}
          {isLoading && <ChefTypingIndicator />}
        </View>
      </ScrollView>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onImageSelect={handleImageAnalysis}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}
