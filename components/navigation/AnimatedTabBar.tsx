import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  withSequence 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const AnimatedTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const handlePress = (route: any, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      translateY.value = withSequence(
        withSpring(10),
        withSpring(0)
      );
      navigation.navigate(route.name);
    }
  };

  return (
    <Animated.View 
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          backgroundColor: 'white',
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB'
        }
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => handlePress(route, isFocused)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 12
            }}
          >
            {options.tabBarIcon?.({ 
              focused: isFocused, 
              color: isFocused ? theme.primary : '#9CA3AF', 
              size: 24 
            })}
            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                color: isFocused ? theme.primary : '#9CA3AF'
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};