import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const PolygonShape = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80">
    <Path
      d="M40 0L75.3 20V60L40 80L4.7 60V20L40 0Z"
      fill="#4ADE80"
    />
  </Svg>
);

export const HealthScore = () => {
  return (
    <View className="rounded-3xl bg-[#25262B] p-6">
      <View className="flex-row">
        <View className="relative">
          <PolygonShape />
          <Text className="absolute inset-0 text-center text-2xl font-bold text-white leading-[80px]">
            72
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-lg font-medium text-white">
            Health Score
          </Text>
          <Text className="my-1.5 text-sm text-gray-400">
            Based on your overall health test, your score is 72 and considered good
          </Text>
          <TouchableOpacity>
            <Text className="text-sm font-medium text-[#4ADE80]">
              Read more
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
