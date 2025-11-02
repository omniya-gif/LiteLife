import React from 'react';
import { Image } from 'react-native';

interface SpoonacularIconProps {
  size?: number;
  color?: string;
}

export const SpoonacularIcon = ({ size = 32 }: SpoonacularIconProps) => {
  return (
    <Image
      source={require('./spoonacular.svg')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
};

export default SpoonacularIcon;
