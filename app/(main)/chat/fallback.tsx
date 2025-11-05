import { useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare, Lightbulb, Book } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChefTypingIndicator from '../../../components/chat/ChefTypingIndicator';
import MessageBubble from '../../../components/chat/MessageBubble';
import MessageInput from '../../../components/chat/MessageInput';
import { getChatResponse } from '../../../lib/openaiApi';
import { useChatStore } from '../../../store/chatStore';

export default function ChatPageFallback() {
  const router = useRouter();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, clearChat } = useChatStore();

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  React.useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        text: "👋 Hi! I'm your personal chef assistant. I can help you with recipes, cooking tips, and nutritional advice. Ask me anything about food and nutrition!",
        sender: 'chef',
        timestamp: new Date(),
      });
    }
    scrollToBottom();
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const QuickQuestionButton = ({
    icon,
    text,
    question,
  }: {
    icon: React.ReactNode;
    text: string;
    question: string;
  }) => (
    <TouchableOpacity
      onPress={() => handleQuickQuestion(question)}
      className="mb-3 flex-row items-center space-x-3 rounded-2xl bg-[#2C2D32] p-4"
      disabled={isLoading}>
      {icon}
      <Text className="text-base font-medium text-white">{text}</Text>
    </TouchableOpacity>
  );

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
          <Text className="font-medium text-green-400">Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView ref={scrollViewRef} className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          {messages.length === 1 && (
            <View className="mb-6">
              <Text className="mb-4 text-center text-lg font-semibold text-white">
                Quick Questions
              </Text>
              <QuickQuestionButton
                icon={<Lightbulb size={20} color="#4ADE80" />}
                text="Healthy breakfast ideas"
                question="What are some healthy breakfast options that are quick to make?"
              />
              <QuickQuestionButton
                icon={<MessageSquare size={20} color="#4ADE80" />}
                text="Daily calorie needs"
                question="How many calories should I eat per day for healthy weight maintenance?"
              />
              <QuickQuestionButton
                icon={<Book size={20} color="#4ADE80" />}
                text="Quick dinner recipe"
                question="Give me a quick and healthy dinner recipe for tonight"
              />
            </View>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.id || index}`}
              {...message}
              isNewMessage={index === messages.length - 1}
            />
          ))}
          {isLoading && <ChefTypingIndicator />}
        </View>
      </ScrollView>

      {/* Message Input - Text Only */}
      <View className="bg-[#25262B] px-4 py-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onImageSelect={() => {}} // Disabled for fallback
          isLoading={isLoading}
          imagePickerDisabled
        />
      </View>
    </SafeAreaView>
  );
}
