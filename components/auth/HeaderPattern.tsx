import React from 'react';
import { View } from 'react-native';
import Svg, { Pattern, Rect, Circle, Defs } from 'react-native-svg';

export const HeaderPattern = () => {
  return (
    <View className="absolute inset-0">
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <Pattern
            id="dots"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <Circle cx="2" cy="2" r="1.5" fill="#4ADE80" opacity="0.3" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dots)" />
      </Svg>
    </View>
  );
};
