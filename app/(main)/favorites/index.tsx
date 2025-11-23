import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Clock, Users, AlertCircle, Plus } from 'lucide-react-native';

import { useRecipeFavorites } from '../../../hooks/useRecipeFavorites';
import { useTheme } from '../../../hooks/useTheme';
import { Recipe } from '../../../services/recipeService';
import { useHealthConnect } from '../../../hooks/useHealthConnect';
import { useHealthConnectWrite } from '../../../hooks/useHealthConnectWrite';

const categories = [
  { id: 'all', title: 'All', icon: '🍽️' },
  { id: 'main course', title: 'Main', icon: '🍲' },
  { id: 'dessert', title: 'Dessert', icon: '🍰' },
  { id: 'breakfast', title: 'Breakfast', icon: '🍳' },
  { id: 'side dish', title: 'Sides', icon: '🥗' },
  { id: 'soup', title: 'Soup', icon: '🍜' },
  { id: 'appetizer', title: 'Apps', icon: '🥟' },
];

export default function FavoritesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addingRecipeId, setAddingRecipeId] = useState<number | null>(null);
  const {
    favorites,
    isLoading,
    error,
    removeFromFavorites,
    refreshFavorites,
  } = useRecipeFavorites();

  // Health Connect
  const nutritionPermissions = [
    { accessType: 'write' as const, recordType: 'Nutrition' },
    { accessType: 'read' as const, recordType: 'Nutrition' },
  ];
  const healthConnect = useHealthConnect(nutritionPermissions);
  const { writeMealToHealthConnect } = useHealthConnectWrite();

  // Filter favorites by category
  const filteredFavorites = useMemo(() => {
    if (selectedCategory === 'all') return favorites;
    return favorites.filter((recipe) =>
      recipe.dishTypes?.some((type) => type.toLowerCase().includes(selectedCategory.toLowerCase()))
    );
  }, [favorites, selectedCategory]);

  const handleRemoveFavorite = async (recipeId: number) => {
    Alert.alert('Remove Favorite', 'Remove this recipe from your favorites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFromFavorites(recipeId);
          } catch {
            Alert.alert('Error', 'Failed to remove favorite. Please try again.');
          }
        },
      },
    ]);
  };

  const handleAddCalories = async (recipe: Recipe) => {
    if (!healthConnect.isAvailable) {
      Alert.alert(
        'Health Connect Not Available',
        'Health Connect is only available on Android 14+. This feature requires Health Connect to track nutrition data.'
      );
      return;
    }

    if (!healthConnect.hasPermissions) {
      Alert.alert(
        'Permission Required',
        'LiteLife needs permission to write nutrition data to Health Connect. Would you like to grant permissions?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Grant Permissions',
            onPress: async () => {
              try {
                await healthConnect.requestHealthPermissions();
              } catch {
                Alert.alert('Error', 'Failed to request permissions. Please try again.');
              }
            },
          },
        ]
      );
      return;
    }

    // Get nutrition info from recipe
    const calories = recipe.calories || 0;
    const recipeWithNutrition = recipe as any;
    const protein =
      recipeWithNutrition.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
    const carbs =
      recipeWithNutrition.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')
        ?.amount || 0;
    const fat =
      recipeWithNutrition.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0;

    if (calories === 0) {
      Alert.alert('No Nutrition Data', 'This recipe does not have calorie information available.');
      return;
    }

    setAddingRecipeId(recipe.id);
    try {
      // Write to Health Connect
      const success = await writeMealToHealthConnect({
        name: recipe.title,
        calories,
        protein: protein > 0 ? protein : undefined,
        carbs: carbs > 0 ? carbs : undefined,
        fat: fat > 0 ? fat : undefined,
      });

      if (success) {
        Alert.alert(
          'Success! ✅',
          `Added ${Math.round(calories)} calories from "${recipe.title}" to Health Connect`
        );
      } else {
        Alert.alert(
          'Error',
          'Failed to add calories to Health Connect. Please check your permissions and try again.'
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to add calories. Please try again.');
    } finally {
      setAddingRecipeId(null);
    }
  };

  const getCalorieColor = (calories: number | undefined) => {
    if (!calories) return theme.primary;
    if (calories > 600) return '#ff6b35';
    if (calories > 400) return '#ffa500';
    return theme.primary;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="bg-[#25262B]">
        <View className="px-6 pt-4 pb-4">
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Heart size={24} color={theme.primary} fill={theme.primary} />
              <Text className="text-2xl font-bold ml-2 text-white">Favorites</Text>
            </View>
          </View>
          {favorites.length > 0 && (
            <Text className="text-sm text-gray-400 mt-2">
              {filteredFavorites.length} of {favorites.length}{' '}
              {favorites.length === 1 ? 'recipe' : 'recipes'}
            </Text>
          )}
        </View>

        {/* Category Filter */}
        {favorites.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-6 pb-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              const count =
                category.id === 'all'
                  ? favorites.length
                  : favorites.filter((recipe) =>
                      recipe.dishTypes?.some((type) =>
                        type.toLowerCase().includes(category.id.toLowerCase())
                      )
                    ).length;

              if (count === 0 && category.id !== 'all') return null;

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full flex-row items-center ${
                    isSelected ? 'bg-[#4ADE80]' : 'bg-[#2C2D32]'
                  }`}
                >
                  <Text className="text-base">{category.icon}</Text>
                  <Text
                    className={`ml-2 text-sm font-semibold ${
                      isSelected ? 'text-black' : 'text-white'
                    }`}
                  >
                    {category.title}
                  </Text>
                  <View
                    className={`ml-2 px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-black/20' : 'bg-[#3C3D42]'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-black' : 'text-gray-400'
                      }`}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View className="mx-4 mt-4 flex-row items-center rounded-xl bg-red-500/10 border border-red-500/30 p-4">
          <AlertCircle size={20} color="#ef4444" />
          <Text className="ml-3 flex-1 text-sm text-red-400">{error}</Text>
          <TouchableOpacity onPress={refreshFavorites}>
            <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Favorites Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshFavorites}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {isLoading && favorites.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text className="text-gray-400 mt-4">Loading favorites...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Heart size={64} color={theme.primary} strokeWidth={1.5} />
            <Text className="text-xl text-white mt-6 mb-2">No Favorites Yet</Text>
            <Text className="text-center text-gray-400 px-8">
              Start adding recipes to your favorites and they'll appear here!
            </Text>
          </View>
        ) : filteredFavorites.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-xl text-white mb-2">No recipes in this category</Text>
            <Text className="text-center text-gray-400 px-8">
              Try selecting a different category
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredFavorites.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                onPress={() => router.push(`/(main)/recipes/${recipe.id}`)}
                className="mb-4 rounded-2xl bg-[#25262B] overflow-hidden"
                style={{ width: '48%' }}
              >
                <View className="relative">
                  <Image
                    source={{ uri: recipe.image }}
                    className="h-32 w-full"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(recipe.id);
                    }}
                    className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/60"
                  >
                    <Heart
                      size={16}
                      color={theme.primary}
                      fill={theme.primary}
                    />
                  </TouchableOpacity>

                  {recipe.calories && recipe.calories > 0 ? (
                    <View
                      className="absolute left-2 bottom-2 px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: getCalorieColor(recipe.calories) }}
                      >
                        {recipe.calories > 600
                          ? `🔥 ${Math.round(recipe.calories)}`
                          : `${Math.round(recipe.calories)} cal`}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View className="p-3">
                  <Text className="text-xs font-semibold mb-1" style={{ color: theme.primary }}>
                    {recipe.dishTypes?.[0]?.toUpperCase() || 'RECIPE'}
                  </Text>
                  <Text className="text-sm font-semibold text-white mb-2" numberOfLines={2}>
                    {recipe.title}
                  </Text>

                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Clock size={12} color="#9CA3AF" />
                      <Text className="ml-1 text-xs text-gray-400">
                        {recipe.readyInMinutes}m
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Users size={12} color="#9CA3AF" />
                      <Text className="ml-1 text-xs text-gray-400">
                        {recipe.servings}
                      </Text>
                    </View>
                  </View>

                  {recipe.calories && recipe.calories > 0 ? (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAddCalories(recipe);
                      }}
                      disabled={addingRecipeId === recipe.id}
                      className="flex-row items-center justify-center rounded-lg py-2"
                      style={{ backgroundColor: `${theme.primary}20` }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: theme.primary }}
                      >
                        {addingRecipeId === recipe.id ? 'Adding...' : 'Add Calories'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}