import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Clock, Users, ChefHat, Star, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../../hooks/useTheme';

const { width } = Dimensions.get('window');

const mockRecipe = {
  id: 1,
  title: 'Chocolate and Szechuan Peppercorn Brownies',
  image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
  author: 'Foodista.com',
  rating: 4.2,
  likes: 24,
  prepTime: '45 Minutes',
  servings: 16,
  pricePerServing: 0.45,
  healthScore: 2,
  spoonacularScore: 39.2,
  summary: 'Chocolate and Szechuan Peppercorn Brownies is an American dessert. This recipe serves 16 and costs 45 cents per serving. One serving contains 304 calories, 5g of protein, and 15g of fat.',
  ingredients: [
    { name: 'brown sugar', amount: '¾', unit: 'cup' },
    { name: 'butter', amount: '185', unit: 'gr' },
    { name: 'cinnamon stick', amount: '1', unit: '', notes: 'broken' },
    { name: 'eggs', amount: '3', unit: '', notes: 'beaten' },
    { name: 'espresso', amount: '1', unit: 'tablespoon' },
    { name: 'all-purpose flour', amount: '3', unit: 'cups' },
    { name: 'granulated sugar', amount: '½', unit: 'cup' },
    { name: 'heavy cream', amount: '1/3', unit: 'cup' },
    { name: 'kosher salt', amount: '¼', unit: 'teaspoon' },
    { name: 'milk', amount: '1', unit: 'tablespoon' },
    { name: 'Szechuan peppercorns', amount: '1', unit: 'tablespoon' },
    { name: 'semisweet chocolate chips', amount: '1/3', unit: 'cup' },
    { name: 'unsweetened chocolate', amount: '1', unit: 'ounce' },
    { name: 'unsweetened cocoa powder', amount: '¾', unit: 'cup' },
    { name: 'vanilla extract', amount: '2', unit: 'teaspoons' }
  ],
  instructions: [
    {
      step: 'Preheat oven to 350',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Grease an 8x8 baking dish',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'In a large saut pan over medium heat, melt the butter and add the peppercorns and the pieces of cinnamon stick',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Meanwhile, in a double boiler or microwave, melt the unsweetened chocolate and semisweet chocolate together',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Stir in the espresso to the melted chocolate',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Once the butter stops foaming and you can see browned bits at the bottom of the pan (about 5 minutes), take off heat and remove the peppercorns and cinnamon stick',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'It may be easier to strain the contents of the pan and then return just the butter to it',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Stir the sugars, milk, vanilla, and salt into the butter in the pan',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Then stir in the cocoa powder and chocolate and espresso mixture',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Beat in the eggs, and then lastly, stir in the flour',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Bake in greased pan for about 25-30 minutes, until a tester comes out clean',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    },
    {
      step: 'Feel free to underbake them a bit',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
    }
  ]
};

const similarRecipes = [
  {
    id: 2,
    title: 'Dark Chocolate Truffles',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32',
    duration: '35 minutes',
    rating: 4.8
  },
  // ...other similar recipes
];

const recipeVideos = [
  {
    id: 1,
    title: 'How to Make Perfect Brownies',
    thumbnail: 'https://images.unsplash.com/photo-1589375025852-a66cdd127efb',
    duration: '5:24',
    views: '125K'
  },
  // ...other recipe videos
];

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'instructions', label: 'Instructions' },
  { id: 'nutrition', label: 'Nutrition' }
];

export default function RecipeDetailsPage() {
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  const renderSimilarRecipes = () => (
    <View className="mt-8">
      <Text className="text-white text-xl font-medium mb-4">Similar Recipes</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="-mx-6 px-6"
      >
        {similarRecipes.map((recipe) => (
          <TouchableOpacity 
            key={recipe.id}
            onPress={() => router.push(`/recipes/${recipe.id}`)}
            className="mr-4 w-[200px]"
          >
            <View className="rounded-2xl overflow-hidden bg-[#25262B]">
              <Image 
                source={{ uri: recipe.image }}
                className="w-full h-[120px]"
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="text-white font-medium mb-1">{recipe.title}</Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Clock size={14} color={theme.primary} />
                    <Text className="text-gray-400 text-sm ml-1">{recipe.duration}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Star size={14} color={theme.primary} />
                    <Text className="text-gray-400 text-sm ml-1">{recipe.rating}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecipeVideos = () => (
    <View className="mt-8">
      <Text className="text-white text-xl font-medium mb-4">Recipe Videos</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="-mx-6 px-6"
      >
        {recipeVideos.map((video) => (
          <TouchableOpacity 
            key={video.id}
            className="mr-4 w-[280px]"
          >
            <View className="rounded-2xl overflow-hidden">
              <View className="relative">
                <Image 
                  source={{ uri: video.thumbnail }}
                  className="w-full h-[160px]"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-md">
                  <Text className="text-white text-xs">{video.duration}</Text>
                </View>
              </View>
              <View className="bg-[#25262B] p-3">
                <Text className="text-white font-medium mb-1">{video.title}</Text>
                <Text className="text-gray-400 text-sm">{video.views} views</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderInstructions = () => (
    <View className="space-y-8">
      {mockRecipe.instructions.map((instruction, index) => (
        <View key={index} className="space-y-4">
          <View className="flex-row">
            <View className="h-8 w-8 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme.primary }}>
              <Text className="text-[#1A1B1E] font-medium">{index + 1}</Text>
            </View>
            <Text className="text-gray-400 flex-1">{instruction.step}</Text>
          </View>
          {instruction.image && (
            <Image 
              source={{ uri: instruction.image }}
              className="w-full h-[200px] rounded-2xl"
              resizeMode="cover"
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View className="space-y-6">
            <Text className="text-gray-400 leading-relaxed">{mockRecipe.summary}</Text>
            
            {/* Stats Grid */}
            <View className="flex-row flex-wrap">
              <View className="w-1/2 p-4 border-r border-b border-[#2C2D32]">
                <View className="flex-row items-center">
                  <Clock size={20} color={theme.primary} />
                  <Text className="text-white ml-2">Prep Time</Text>
                </View>
                <Text className="text-gray-400 mt-1">{mockRecipe.prepTime}</Text>
              </View>
              <View className="w-1/2 p-4 border-b border-[#2C2D32]">
                <View className="flex-row items-center">
                  <Users size={20} color={theme.primary} />
                  <Text className="text-white ml-2">Servings</Text>
                </View>
                <Text className="text-gray-400 mt-1">{mockRecipe.servings} People</Text>
              </View>
              <View className="w-1/2 p-4 border-r border-[#2C2D32]">
                <View className="flex-row items-center">
                  <Star size={20} color={theme.primary} />
                  <Text className="text-white ml-2">Rating</Text>
                </View>
                <Text className="text-gray-400 mt-1">{mockRecipe.rating}/5</Text>
              </View>
              <View className="w-1/2 p-4">
                <View className="flex-row items-center">
                  <Info size={20} color={theme.primary} />
                  <Text className="text-white ml-2">Price</Text>
                </View>
                <Text className="text-gray-400 mt-1">${mockRecipe.pricePerServing}/serving</Text>
              </View>
            </View>
            {renderSimilarRecipes()}
            {renderRecipeVideos()}
          </View>
        );
      
      case 'ingredients':
        return (
          <View className="space-y-4">
            {mockRecipe.ingredients.map((ingredient, index) => (
              <View 
                key={index}
                className="flex-row items-center justify-between py-4 border-b border-[#2C2D32]"
              >
                <Text className="text-white flex-1">{ingredient.name}</Text>
                <Text className="text-gray-400">
                  {ingredient.amount} {ingredient.unit}
                  {ingredient.notes && ` (${ingredient.notes})`}
                </Text>
              </View>
            ))}
          </View>
        );
      
      case 'instructions':
         return renderInstructions();
      
      case 'nutrition':
        return (
          <TouchableOpacity 
            onPress={() => router.push(`/recipes/${mockRecipe.id}/nutrition`)}
            className="bg-[#25262B] rounded-2xl p-6"
          >
            <Text className="text-white text-lg font-medium mb-4">Nutrition Facts</Text>
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-400">Health Score</Text>
              <Text style={{ color: theme.primary }}>{mockRecipe.healthScore}/100</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-400">Spoonacular Score</Text>
              <Text style={{ color: theme.primary }}>{mockRecipe.spoonacularScore}/100</Text>
            </View>
            <Text className="text-gray-400 text-sm mt-4">
              Tap to view detailed nutrition information
            </Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <ScrollView className="flex-1">
        {/* Header Image */}
        <View className="h-[300px]">
          <Image 
            source={{ uri: mockRecipe.image }}
            className="absolute w-full h-full"
            resizeMode="cover"
          />
          <View className="flex-row items-center justify-between px-6 pt-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="h-12 w-12 items-center justify-center rounded-xl bg-black/20"
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsFavorite(!isFavorite)}
              className="h-9 w-9 items-center justify-center rounded-xl bg-white"
            >
              <Heart 
                size={16} 
                color={theme.primary}
                fill={isFavorite ? theme.primary : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <Animated.View 
          entering={FadeInDown.springify()}
          className="bg-[#1A1B1E] -mt-10 rounded-t-[36px] p-6"
        >
          {/* Author */}
          <View className="flex-row items-center mb-4">
            <ChefHat size={16} color={theme.primary} />
            <Text className="text-sm font-medium ml-2" style={{ color: theme.primary }}>{mockRecipe.author}</Text>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-medium">{mockRecipe.title}</Text>

          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mt-6 -mx-6 px-6"
          >
            <View className="flex-row">
              {tabs.map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className="mr-4 pb-2 border-b-2"
                  style={{ borderBottomColor: activeTab === tab.id ? theme.primary : 'transparent' }}
                >
                  <Text style={{ color: activeTab === tab.id ? theme.primary : '#9CA3AF' }}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Tab Content */}
          <View className="mt-6">
            {renderTabContent()}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Add to Journal Button */}
      <View className="p-6 bg-[#1A1B1E] border-t border-[#2C2D32]">
        <TouchableOpacity 
          onPress={() => router.push('/journal')}
          className="w-full h-[54px] rounded-2xl items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-white font-medium">Add to Journal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}