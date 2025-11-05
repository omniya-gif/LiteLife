import { ChevronRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, ImageBackground } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  FadeInDown,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';

interface ToggleableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultVisible?: boolean;
  delay?: number;
  onToggle?: (isVisible: boolean) => void;
  backgroundImage?: string;
  subtitle?: string;
  duration?: string;
  exerciseCount?: string;
}

export const ToggleableSection: React.FC<ToggleableSectionProps> = ({
  title,
  children,
  defaultVisible = false,
  delay = 0,
  onToggle,
  backgroundImage,
  subtitle,
  duration,
  exerciseCount,
}) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const rotation = useSharedValue(defaultVisible ? 90 : 0);
  const contentHeight = useSharedValue(defaultVisible ? 1 : 0);

  const toggleSection = () => {
    try {
      console.log(`[ToggleableSection] Toggling ${title} from ${isVisible} to ${!isVisible}`);

      const newVisibleState = !isVisible;
      setIsVisible(newVisibleState);

      // Animate chevron rotation
      rotation.value = withSpring(newVisibleState ? 90 : 0, {
        damping: 18,
        stiffness: 200,
      });

      // Animate content visibility
      contentHeight.value = withTiming(newVisibleState ? 1 : 0, {
        duration: 250,
      });

      // Call onToggle callback if provided
      onToggle?.(newVisibleState);

      console.log(`[ToggleableSection] Successfully toggled ${title} to ${newVisibleState}`);
    } catch (error) {
      console.error(`[ToggleableSection] Error toggling ${title}:`, error);
    }
  };

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentHeight.value,
    transform: [{ scale: contentHeight.value }],
  }));

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isVisible ? '#FFD700' : '#FFFFFF80',
    transform: [{ scale: contentHeight.value * 0.5 + 0.5 }],
  }));
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      layout={Layout.springify()}
      className="mb-4">
      {/* Large Card matching the image */}
      <TouchableOpacity
        onPress={toggleSection}
        className="relative overflow-hidden rounded-3xl"
        activeOpacity={0.8}
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
        }}>
        {backgroundImage ? (
          <ImageBackground
            source={{ uri: backgroundImage }}
            className="h-48 w-full"
            style={{ borderRadius: 24 }}
            imageStyle={{ borderRadius: 24 }}>
            <View
              className="h-full w-full justify-end p-6"
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 24,
              }}>
              {/* Status indicator and chevron in top right */}
              <View className="absolute right-6 top-6 flex-row items-center">
                <Animated.View
                  style={[
                    indicatorAnimatedStyle,
                    {
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      marginRight: 10,
                    },
                  ]}
                />
                <Animated.View style={chevronAnimatedStyle}>
                  <ChevronRight size={28} color="#FFFFFF" />
                </Animated.View>
              </View>

              {/* Content in bottom left like the image */}
              <View>
                <Text className="mb-2 text-3xl font-bold text-white">{title}</Text>
                {(duration || exerciseCount) && (
                  <Text className="text-lg text-white/90">
                    {duration && duration}
                    {duration && exerciseCount && ' - '}
                    {exerciseCount && exerciseCount}
                  </Text>
                )}
                {subtitle && <Text className="mt-1 text-sm text-white/70">{subtitle}</Text>}
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View
            className="h-48 w-full justify-end p-6"
            style={{
              backgroundColor: '#4ADE80',
            }}>
            {/* Status indicator and chevron */}
            <View className="absolute right-6 top-6 flex-row items-center">
              <Animated.View
                style={[
                  indicatorAnimatedStyle,
                  {
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    marginRight: 10,
                  },
                ]}
              />
              <Animated.View style={chevronAnimatedStyle}>
                <ChevronRight size={28} color="#FFFFFF" />
              </Animated.View>
            </View>

            {/* Title and subtitle */}
            <View>
              <Text className="mb-2 text-3xl font-bold text-white">{title}</Text>
              {(duration || exerciseCount) && (
                <Text className="text-lg text-white/90">
                  {duration && duration}
                  {duration && exerciseCount && ' - '}
                  {exerciseCount && exerciseCount}
                </Text>
              )}
              {subtitle && <Text className="mt-1 text-sm text-white/70">{subtitle}</Text>}
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Content */}
      {isVisible && (
        <Animated.View
          entering={FadeInDown.duration(300).springify()}
          exiting={FadeOutUp.duration(200)}
          style={contentAnimatedStyle}
          layout={Layout.springify()}>
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default ToggleableSection;
