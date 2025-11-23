import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Search, Heart, ChevronRight, AlertCircle } from 'lucide-react-native';

import { useTheme } from '../../../hooks/useTheme';
import { searchRecipes, getFeaturedRecipes, Recipe } from '../../../services/recipeService';
import { Header } from '../../../components/home/Header';
import { BottomNavigation } from '../home/components/BottomNavigation';

const categories = [
  {
    id: 'main course',
    title: 'Main Course',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  },
  {
    id: 'side dish',
    title: 'Side Dishes',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
  },
  {
    id: 'soup',
    title: 'Soups',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
  },
  {
    id: 'dessert',
    title: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
  },
  {
    id: 'breakfast',
    title: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
  },
  {
    id: 'bread',
    title: 'Bread',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  },
];

export default function RecipesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const featuredAnim = useRef(new Animated.Value(0)).current;
  const categoryAnimsRef = useRef(categories.map(() => new Animated.Value(0)));
  const categoryAnims = categoryAnimsRef.current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Load favorites from AsyncStorage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('favoriteRecipes');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Load featured recipes
  useEffect(() => {
    loadFeaturedRecipes();
  }, []);

  const loadFeaturedRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const recipes = await getFeaturedRecipes(6);
      setFeaturedRecipes(recipes);
    } catch (error) {
      console.error('Error loading featured recipes:', error);
      setError('Failed to load recipes. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCategory(categoryId);
      const recipes = await searchRecipes('', { type: categoryId }, 12);
      setFeaturedRecipes(recipes);
      
      // Scroll to results after a short delay to let content render
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 600, animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading category recipes:', error);
      setError('Failed to load recipes.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    loadFeaturedRecipes();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const getCalorieColor = (calories: number | undefined) => {
    if (!calories) return theme.primary;
    if (calories > 600) return '#ff6b35'; // High calories - orange
    if (calories > 400) return '#ffa500'; // Medium-high - lighter orange
    return theme.primary; // Normal - primary color
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedRecipes();
    setRefreshing(false);
  };

  // Search recipes with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await searchRecipes(searchQuery, {}, 12);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching recipes:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const toggleFavorite = async (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    
    try {
      await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
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
        <Header />
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
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
                    {searching ? (
                      <View className="items-center py-8">
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text className="mt-2 text-gray-400">Searching recipes...</Text>
                      </View>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((recipe) => (
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
                                  {recipe.dishTypes?.[0]?.toUpperCase() || 'RECIPE'}
                                </Text>
                                <Text className="mb-2 text-lg font-medium text-white" numberOfLines={2}>
                                  {recipe.title}
                                </Text>
                                <Text className="text-sm text-gray-400" numberOfLines={2}>
                                  {recipe.summary?.replace(/<[^>]*>?/gm, '') || 'Delicious recipe'}
                                </Text>
                              </View>

                              <View className="flex-row items-center justify-between">
                                <Text className="text-sm text-gray-400">
                                  {recipe.readyInMinutes} mins • {recipe.calories || 0} cal
                                </Text>
                                <TouchableOpacity
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(recipe.id);
                                  }}
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
                      ))
                    ) : (
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
            {error && (
              <View className="mx-4 mt-4 flex-row items-center rounded-xl bg-red-500/10 border border-red-500/30 p-4">
                <AlertCircle size={20} color="#ef4444" />
                <Text className="ml-3 flex-1 text-sm text-red-400">{error}</Text>
                <TouchableOpacity onPress={loadFeaturedRecipes}>
                  <Text className="text-sm font-semibold" style={{ color: theme.primary }}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="px-6 pt-6">
              {selectedCategory && (
                <TouchableOpacity
                  onPress={handleClearCategory}
                  className="mb-4 flex-row items-center"
                >
                  <Text className="text-base" style={{ color: theme.primary }}>← Back to Categories</Text>
                </TouchableOpacity>
              )}
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-white">
                  {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.title : 'Featured Recipes'}
                </Text>
                {!selectedCategory && (
                  <TouchableOpacity onPress={loadFeaturedRecipes}>
                    <Text className="text-base font-medium" style={{ color: theme.primary }}>
                      Refresh
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {loading ? (
              <View className="items-center py-12">
                <ActivityIndicator size="large" color={theme.primary} />
                <Text className="mt-2 text-gray-400">Loading recipes...</Text>
              </View>
            ) : (
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
                        {recipe.dishTypes?.[0]?.toUpperCase() || 'RECIPE'}
                      </Text>
                      <Text className="mb-2 text-lg font-medium text-white" numberOfLines={2}>{recipe.title}</Text>
                      <Text className="mb-2 text-sm text-gray-400" numberOfLines={2}>
                        {recipe.summary?.replace(/<[^>]*>?/gm, '') || 'Delicious recipe'}
                      </Text>
                      <View className="mb-4 flex-row items-center gap-3">
                        <Text className="text-xs text-gray-500">⏱️ {recipe.readyInMinutes} min</Text>
                        <Text className="text-xs text-gray-500">🍽️ {recipe.servings} servings</Text>
                      </View>
                      
                      {/* Calorie Badge */}
                      {recipe.calories && recipe.calories > 0 && (
                        <View 
                          className="mb-4 self-start px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: `${getCalorieColor(recipe.calories)}20` }}
                        >
                          <Text 
                            className="text-sm font-semibold"
                            style={{ color: getCalorieColor(recipe.calories) }}
                          >
                            🔥 {Math.round(recipe.calories)} cal
                            {recipe.calories > 600 && ' • High'}
                            {recipe.calories > 400 && recipe.calories <= 600 && ' • Medium'}
                          </Text>
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View className="flex-row justify-between">
                        <TouchableOpacity
                          onPress={() => router.push(`/recipes/${recipe.id}`)}
                          className="mr-2 h-12 flex-1 items-center justify-center rounded-xl"
                          style={{ backgroundColor: theme.primary }}>
                          <Text className="font-medium text-white">View Recipe</Text>
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
            )}

            {!selectedCategory && (
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
                      onPress={() => handleCategoryPress(category.id)}
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
            )}
          </>
        )}
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}
