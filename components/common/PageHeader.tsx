import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PageHeaderProps {
  title: string;
  imageUrl?: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
}

export const PageHeader = ({
  title,
  imageUrl,
  showBackButton = true,
  rightContent,
}: PageHeaderProps) => {
  const router = useRouter();

  const headerContent = (
    <SafeAreaView edges={['top']}>
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between">
          {showBackButton ? (
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/20">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <View className="h-10 w-10" />
          )}

          <Text className="mx-4 flex-1 text-center text-2xl font-bold text-white">{title}</Text>

          {rightContent || <View className="h-10 w-10" />}
        </View>
      </View>
    </SafeAreaView>
  );

  if (imageUrl) {
    return (
      <ImageBackground source={{ uri: imageUrl }} className="min-h-[120px]" resizeMode="cover">
        <View className="min-h-[120px] bg-black/50">{headerContent}</View>
      </ImageBackground>
    );
  }

  return <View className="min-h-[120px] bg-[#25262B]">{headerContent}</View>;
};
