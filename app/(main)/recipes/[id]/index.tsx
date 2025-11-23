import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Clock, Users, Share2, AlertCircle, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '../../../../hooks/useTheme';
import { getRecipeDetails, getSimilarRecipes, Recipe } from '../../../../services/recipeService';

export default function RecipeDetailPage() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [recipe, setRecipe] = useState<any>(null);
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecipeData();
    }
  }, [id]);

  const fetchRecipeData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const recipeData = await getRecipeDetails(parseInt(id));
      setRecipe(recipeData);
      
      // Check if recipe is in favorites
      const stored = await AsyncStorage.getItem('favoriteRecipes');
      const favorites = stored ? JSON.parse(stored) : [];
      setIsFavorite(favorites.includes(parseInt(id)));
      
      // Get similar recipes
      const similar = await getSimilarRecipes(parseInt(id), 3);
      setSimilarRecipes(similar);
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recipe details');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!id) return;
    
    const recipeId = parseInt(id);
    const stored = await AsyncStorage.getItem('favoriteRecipes');
    let favorites = stored ? JSON.parse(stored) : [];
    
    if (isFavorite) {
      favorites = favorites.filter((favId: number) => favId !== recipeId);
    } else {
      favorites.push(recipeId);
    }
    
    await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this recipe: ${recipe?.title}`,
        title: recipe?.title || 'Recipe',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Recipe</Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="mt-4 text-gray-400">Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1B1E]">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Error</Text>
          <View style={{ width: 24 }} />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <AlertCircle size={64} color="#ef4444" />
          <Text className="mt-4 text-xl font-bold text-white text-center">
            {error || 'Recipe Not Found'}
          </Text>
          <Text className="mt-2 text-gray-400 text-center">
            {error || "The recipe you're looking for doesn't exist"}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 rounded-xl"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ingredients = recipe.extendedIngredients || [];
  const instructions = recipe.analyzedInstructions?.[0]?.steps || [];
  const nutrition = recipe.nutrition?.nutrients || [];
  
  const getNutrient = (name: string) => {
    const nutrient = nutrition.find((n: any) => n.name === name);
    return nutrient?.amount || 0;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white" numberOfLines={1}>Recipe</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={toggleFavorite}>
            <Heart 
              size={24} 
              color={isFavorite ? theme.primary : 'white'}
              fill={isFavorite ? theme.primary : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Share2 size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Recipe Image */}
        <View className="relative h-64">
          <Image
            source={{ uri: recipe.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-gradient-to-t from-[#1A1B1E] to-transparent" />
          <View className="absolute bottom-0 left-0 right-0 p-6">
            <Text className="text-3xl font-bold text-white mb-2">{recipe.title}</Text>
            <View className="flex-row gap-4">
              <View className="flex-row items-center gap-2">
                <Clock size={20} color={theme.primary} />
                <Text className="text-white">{recipe.readyInMinutes} min</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Users size={20} color={theme.primary} />
                <Text className="text-white">{recipe.servings} servings</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <Animated.View entering={FadeInDown.delay(100)} className="p-6 bg-[#25262B] m-4 rounded-2xl">
          <Text className="text-2xl font-bold text-white mb-4">Ingredients</Text>
          <Text className="text-sm text-gray-400 mb-4">Servings: {recipe.servings}</Text>
          {ingredients.length > 0 ? (
            <View className="space-y-3">
              {ingredients.map((ingredient: any, index: number) => (
                <View key={index} className="flex-row items-start gap-3 py-2">
                  <Text style={{ color: theme.primary }}>●</Text>
                  <Text className="flex-1 text-white">
                    {ingredient.amount ? `${ingredient.amount.toFixed(1)} ` : ''}
                    {ingredient.unit} {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-400">Ingredient information not available</Text>
          )}
        </Animated.View>

        {/* Instructions */}
        <Animated.View entering={FadeInDown.delay(200)} className="p-6 bg-[#25262B] m-4 rounded-2xl">
          <Text className="text-2xl font-bold text-white mb-4">Instructions</Text>
          {instructions.length > 0 ? (
            <View className="space-y-6">
              {instructions.map((step: any, index: number) => (
                <View key={index} className="flex-row gap-4">
                  <View 
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <Text className="text-[#1A1B1E] font-bold">{step.number}</Text>
                  </View>
                  <Text className="flex-1 text-white leading-6">{step.step}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-400">Instruction information not available</Text>
          )}
        </Animated.View>

        {/* Nutrition */}
        {nutrition.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300)} className="p-6 bg-[#25262B] m-4 rounded-2xl">
            <Text className="text-2xl font-bold text-white mb-4">Nutrition Facts</Text>
            
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-lg">Calories</Text>
                <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
                  {getNutrient('Calories').toFixed(0)}
                </Text>
              </View>
              <View className="h-2 bg-gray-800 rounded-full">
                <View 
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((getNutrient('Calories') / 2000) * 100, 100)}%`,
                    backgroundColor: theme.primary 
                  }}
                />
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {['Protein', 'Carbohydrates', 'Fat', 'Fiber'].map((nutrient) => {
                const amount = getNutrient(nutrient);
                if (amount === 0) return null;
                
                return (
                  <View key={nutrient} className="flex-1 min-w-[45%] p-4 bg-[#2C2D32] rounded-xl">
                    <Text className="text-gray-400 text-sm mb-1">{nutrient}</Text>
                    <Text className="text-white text-xl font-bold">{amount.toFixed(1)}g</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Similar Recipes */}
        {similarRecipes.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)} className="p-6 bg-[#25262B] m-4 rounded-2xl">
            <Text className="text-2xl font-bold text-white mb-4">Similar Recipes</Text>
            <View className="space-y-3">
              {similarRecipes.map((similar) => (
                <TouchableOpacity
                  key={similar.id}
                  onPress={() => router.push(`/recipes/${similar.id}`)}
                  className="flex-row items-center gap-3 p-3 bg-[#2C2D32] rounded-xl"
                >
                  <Image
                    source={{ uri: similar.image }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text className="text-white font-medium" numberOfLines={2}>
                      {similar.title}
                    </Text>
                    {similar.readyInMinutes > 0 && (
                      <Text className="text-gray-400 text-sm mt-1">
                        {similar.readyInMinutes} minutes
                      </Text>
                    )}
                  </View>
                  <ChevronRight size={20} color={theme.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}