import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { ChatMessage } from '../../store/chatStore';

interface MessageBubbleProps extends ChatMessage {
  onSuggestionSelect?: (type: 'calories' | 'health' | 'recipes') => void;
  onLoadMore?: () => void;
  isNewMessage?: boolean;
}

export default function MessageBubble({
  text,
  sender,
  image,
  type,
  metadata,
  onSuggestionSelect,
  onLoadMore,
}: MessageBubbleProps) {
  const isUser = sender === 'user';

  const SuggestionButtons = () => (
    <View className="mt-3 flex-row space-x-2">
      <TouchableOpacity
        onPress={() => onSuggestionSelect?.('calories')}
        className="rounded-full bg-green-100 px-3 py-2">
        <Text className="text-sm font-medium text-green-800">Analyze Calories</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onSuggestionSelect?.('health')}
        className="rounded-full bg-blue-100 px-3 py-2">
        <Text className="text-sm font-medium text-blue-800">Health Impact</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onSuggestionSelect?.('recipes')}
        className="rounded-full bg-purple-100 px-3 py-2">
        <Text className="text-sm font-medium text-purple-800">Similar Recipes</Text>
      </TouchableOpacity>
    </View>
  );

  const NutritionalInfo = () => {
    if (!metadata?.nutritionalInfo) return null;

    return (
      <View className="mt-3 rounded-lg bg-gray-50 p-3">
        <Text className="mb-2 font-semibold text-gray-800">Nutritional Breakdown</Text>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Protein: {metadata.nutritionalInfo.protein}</Text>
          <Text className="text-gray-600">Carbs: {metadata.nutritionalInfo.carbs}</Text>
          <Text className="text-gray-600">Fats: {metadata.nutritionalInfo.fats}</Text>
        </View>
        <View className="mt-2">
          <Text className="text-gray-600">
            Glucose Impact:{' '}
            <Text
              className={
                metadata.nutritionalInfo.glucoseImpact === 'high'
                  ? 'text-red-600'
                  : metadata.nutritionalInfo.glucoseImpact === 'medium'
                    ? 'text-yellow-600'
                    : 'text-green-600'
              }>
              {metadata.nutritionalInfo.glucoseImpact}
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-green-500' : 'bg-[#2C2D32]'}`}>
        {image && <Image source={{ uri: image.uri }} className="mb-2 h-48 w-48 rounded-lg" />}

        {text && (
          <Text className={`${isUser ? 'text-white' : 'text-white'} text-base`}>{text}</Text>
        )}

        {type === 'calories' && <NutritionalInfo />}

        {type === 'health' && (
          <View className="mt-2">
            <Text className="text-sm text-white">{text}</Text>
          </View>
        )}

        {onSuggestionSelect && !isUser && image && <SuggestionButtons />}

        {metadata?.hasMore && onLoadMore && (
          <TouchableOpacity onPress={onLoadMore} className="mt-3 rounded-lg bg-green-600 px-4 py-2">
            <Text className="text-center font-medium text-white">Load More Recipes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
