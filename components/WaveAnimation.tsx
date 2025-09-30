import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const WaveAnimation = () => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 5000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const points1 = [];
    const points2 = [];
    
    for (let i = 0; i <= width; i++) {
      const val1 = 15 * Math.sin((2 * Math.PI * (progress.value + i / width)));
      const val2 = 15 * Math.sin((2 * Math.PI * (progress.value + (1 - i / width))));
      points1.push(`${i},${width - 15 + val1}`);
      points2.push(`${width - i},${15 + val2}`);
    }

    const d = `
      M 0,0
      L ${points1[0]}
      ${points1.join(' L ')}
      L ${points2[0]}
      ${points2.join(' L ')}
      L ${points2[points2.length - 1]}
      L ${points1[0]}
      Z
    `;

    return {
      d,
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <Svg width={width} height={width}>
        <AnimatedPath
          animatedProps={animatedProps}
          fill="#0043F9"
        />
      </Svg>
    </View>
  );
};