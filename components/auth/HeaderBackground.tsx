import React from 'react';
import { View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const HeaderBackground = () => {
  return (
    <View className="absolute inset-0">
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop"
        }}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          'rgba(26, 27, 30, 0.75)',
          'rgba(26, 27, 30, 0.92)',
          '#1A1B1E'
        ]}
        locations={[0, 0.7, 1]}
        className="absolute inset-0"
      />
    </View>
  );
};
