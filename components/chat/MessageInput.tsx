import * as ImagePicker from 'expo-image-picker';
import { Camera, Send, Image } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onImageSelect: (base64: string) => void;
  isLoading: boolean;
  imagePickerDisabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onImageSelect,
  isLoading,
  imagePickerDisabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleImagePicker = async () => {
    try {
      // Check if expo-image-picker is available
      if (!ImagePicker.launchImageLibraryAsync) {
        Alert.alert(
          'Feature Not Available',
          'Image picker is not available in this build. Please use Expo Go or create a development build with expo-image-picker.'
        );
        return;
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        onImageSelect(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        'Image picker is not available in this build. Please use Expo Go or rebuild with development build.'
      );
    }
  };

  const handleCamera = async () => {
    try {
      // Check if expo-image-picker is available
      if (!ImagePicker.launchCameraAsync) {
        Alert.alert(
          'Feature Not Available',
          'Camera is not available in this build. Please use Expo Go or create a development build with expo-image-picker.'
        );
        return;
      }

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        onImageSelect(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Error',
        'Camera is not available in this build. Please use Expo Go or rebuild with development build.'
      );
    }
  };

  return (
    <View className="flex-row items-center space-x-3 bg-[#25262B] p-4">
      {!imagePickerDisabled && (
        <>
          <TouchableOpacity onPress={handleCamera} disabled={isLoading} className="p-2">
            <Camera size={24} color={isLoading ? '#666' : '#4ADE80'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleImagePicker} disabled={isLoading} className="p-2">
            <Image size={24} color={isLoading ? '#666' : '#4ADE80'} />
          </TouchableOpacity>
        </>
      )}

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Ask about nutrition, recipes..."
        placeholderTextColor="#999"
        className="flex-1 rounded-full bg-[#2C2D32] px-4 py-3 text-white"
        editable={!isLoading}
        multiline
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={isLoading || !message.trim()}
        className="p-2">
        <Send size={24} color={isLoading || !message.trim() ? '#666' : '#4ADE80'} />
      </TouchableOpacity>
    </View>
  );
}
