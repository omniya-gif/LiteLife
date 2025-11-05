import { useRouter } from 'expo-router';
import { Search, Heart, Info, ChevronRight } from 'lucide-react-native';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../../components/home/Header';
import { BottomNavigation } from '../home/components/BottomNavigation';
import { TabBar } from '../home/components/TabBar';
import { useTheme } from '../../../hooks/useTheme';

const categories = [
  {
    id: 'main',
    title: 'Main Course',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  },
  {
    id: 'vegetables',
    title: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
  },
  {
    id: 'soups',
    title: 'Soups',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
  },
  {
    id: 'desserts',
    title: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
  },
  {
    id: 'pastas',
    title: 'Pastas',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800',
  },
  {
    id: 'bread',
    title: 'Bread',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  },
];

const featuredRecipes = [
  {
    id: 1,
    title: 'Tartine Bread',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    duration: '48 minutes',
    type: 'Guided',
    summary: 'A classic sourdough bread recipe that brings the artisanal bakery experience home.',
    dishTypes: ['breakfast', 'snack'],
  },
  {
    id: 2,
    title: 'Tomato Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    duration: '30 minutes',
    type: 'Listed',
    summary: 'Creamy tomato soup with fresh basil and garlic croutons.',
    dishTypes: ['lunch', 'dinner'],
  },
  {
    id: 3,
    title: 'Chicken Noodles',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    duration: '30 minutes',
    type: 'Listed',
    summary: 'Classic chicken noodle soup with tender vegetables and herbs.',
    dishTypes: ['lunch', 'dinner'],
  },
];

export default function RecipesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchQuery) return [];
    return featuredRecipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.dishTypes.some((type) => type.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const featuredAnim = useRef(new Animated.Value(0)).current;
  const categoryAnims = categories.map(() => useRef(new Animated.Value(0)).current);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]));
  };

  useEffect(() => {
    // Header animation
    Animated.spring(headerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 10,
      friction: 2,
    }).start();

    // Featured recipes animation
    Animated.spring(featuredAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 20,
      friction: 7,
      delay: 300,
    }).start();

    // Staggered category animations
    categoryAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
        delay: 500 + index * 100,
      }).start();
    });
  }, []);

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: searchVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start();
  }, [searchVisible]);

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Animated.View
        style={{
          opacity: headerAnim,
          transform: [
            {
              scale: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        }}
        className="border-b border-[#25262B]">
        <Header
          title="Recipes"
          imageUrl="https://images.unsplash.com/photo-1599566150163-29194dcaad36"
        />
      </Animated.View>

      <ScrollView className="flex-1">
        <View className="px-4 pt-12">
          <Animated.View
            style={{
              opacity: searchVisible ? searchAnim : 1,
              transform: [
                {
                  translateY: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            }}>
            {searchVisible ? (
              <View className="space-y-4">
                <View className="flex-row items-center rounded-2xl bg-[#2C2D32] px-6 py-4 shadow-lg">
                  <Search size={24} color="#fff" />
                  <TextInput
                    className="ml-3 flex-1 text-lg text-white"
                    placeholder="Search recipes..."
                    placeholderTextColor="#666"
                    autoFocus
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSearchVisible(false);
                      setSearchQuery('');
                    }}
                    className="rounded-full px-4 py-2"
                    style={{ backgroundColor: `${theme.primary}20` }}>
                    <Text className="text-base font-medium" style={{ color: theme.primary }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                {searchQuery.length > 0 && (
                  <ScrollView className="mt-4" contentContainerStyle={{ gap: 16 }}>
                    {filteredRecipes.map((recipe) => (
                      <TouchableOpacity
                        key={recipe.id}
                        onPress={() => router.push(`/recipes/${recipe.id}`)}
                        className="overflow-hidden rounded-3xl bg-[#25262B]">
                        <View className="flex-row">
                          <Image
                            source={{ uri: recipe.image }}
                            className="h-32 w-32"
                            resizeMode="cover"
                          />
                          <View className="flex-1 justify-between p-4">
                            <View>
                              <Text className="mb-1 text-sm font-medium" style={{ color: theme.primary }}>
                                {recipe.dishTypes[0]?.toUpperCase()}
                              </Text>
                              <Text className="mb-2 text-lg font-medium text-white">
                                {recipe.title}
                              </Text>
                              <Text className="text-sm text-gray-400" numberOfLines={2}>
                                {recipe.summary}
                              </Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                              <Text className="text-sm text-gray-400">{recipe.duration}</Text>
                              <TouchableOpacity
                                onPress={() => toggleFavorite(recipe.id)}
                                className="h-8 w-8 items-center justify-center rounded-full bg-[#2C2D32]">
                                <Heart
                                  size={16}
                                  color={favorites.includes(recipe.id) ? theme.primary : 'white'}
                                  fill={favorites.includes(recipe.id) ? theme.primary : 'transparent'}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}

                    {filteredRecipes.length === 0 && (
                      <View className="items-center py-8">
                        <Text className="text-gray-400">No recipes found</Text>
                      </View>
                    )}
                  </ScrollView>
                )}
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setSearchVisible(true)}
                className="flex-row items-center rounded-2xl bg-[#2C2D32] px-6 py-4 shadow-lg">
                <Search size={24} color={theme.primary} />
                <Text className="ml-3 text-lg text-gray-400">What would you like to cook?</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        {!searchVisible && (
          <>
            <View className="px-6 pt-6">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-white">Featured Recipes</Text>
                <TouchableOpacity>
                  <Text className="text-base font-medium" style={{ color: theme.primary }}>See All</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-8"
              contentContainerStyle={{ paddingHorizontal: 24 }}>
              {featuredRecipes.map((recipe, index) => (
                <Animated.View
                  key={recipe.id}
                  style={{
                    transform: [
                      {
                        translateX: featuredAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [100 * (index + 1), 0],
                        }),
                      },
                    ],
                    opacity: featuredAnim,
                  }}>
                  <TouchableOpacity
                    onPress={() => router.push(`/recipes/${recipe.id}`)}
                    className="mr-4 overflow-hidden rounded-3xl bg-[#25262B]"
                    style={{ width: 280 }}>
                    <View className="relative">
                      <Image
                        source={{ uri: recipe.image }}
                        className="h-40 w-full"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => toggleFavorite(recipe.id)}
                        className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-black/20">
                        <Heart
                          size={20}
                          color={favorites.includes(recipe.id) ? theme.primary : 'white'}
                          fill={favorites.includes(recipe.id) ? theme.primary : 'transparent'}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="p-4">
                      <Text className="mb-2 text-sm font-medium" style={{ color: theme.primary }}>
                        {recipe.dishTypes[0]?.toUpperCase()}
                      </Text>
                      <Text className="mb-2 text-lg font-medium text-white">{recipe.title}</Text>
                      <Text className="mb-4 text-sm text-gray-400" numberOfLines={2}>
                        {recipe.summary}
                      </Text>

                      {/* Action Buttons */}
                      <View className="flex-row justify-between">
                        <TouchableOpacity
                          onPress={() => router.push('/journal')}
                          className="mr-2 h-12 flex-1 items-center justify-center rounded-xl"
                          style={{ backgroundColor: theme.primary }}>
                          <Text className="font-medium text-white">Add to Journal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => router.push(`/recipes/${recipe.id}/nutrition`)}
                          className="mx-2 h-12 w-12 items-center justify-center rounded-xl bg-[#2C2D32]">
                          <Info size={20} color={theme.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => router.push(`/recipes/${recipe.id}`)}
                          className="h-12 w-12 items-center justify-center rounded-xl bg-[#2C2D32]">
                          <ChevronRight size={20} color={theme.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>

            <View className="px-6">
              <Text className="mb-4 text-2xl font-bold text-white">Categories</Text>
              <View className="flex-row flex-wrap justify-between">
                {categories.map((category, index) => (
                  <Animated.View
                    key={category.id}
                    style={{
                      width: '48%',
                      marginBottom: 16,
                      opacity: categoryAnims[index],
                      transform: [
                        {
                          translateY: categoryAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        },
                      ],
                    }}>
                    <TouchableOpacity
                      className="overflow-hidden rounded-2xl"
                      style={{ aspectRatio: 1 }}>
                      <Image
                        source={{ uri: category.image }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                      <View className="absolute bottom-0 left-0 right-0 bg-black/30 p-4">
                        <Text className="text-lg font-bold text-white">{category.title}</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}
