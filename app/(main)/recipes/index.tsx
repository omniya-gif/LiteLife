import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TabBar } from '../home/components/TabBar';
import { Header } from '../home/components/Header';
import { BottomNavigation } from '../home/components/BottomNavigation';

const categories = [
  {
    id: 'main',
    title: 'Main Course',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800'
  },
  {
    id: 'vegetables',
    title: 'Vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800'
  },
  {
    id: 'soups',
    title: 'Soups',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800'
  },
  {
    id: 'desserts',
    title: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800'
  },
  {
    id: 'pastas',
    title: 'Pastas',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800'
  },
  {
    id: 'bread',
    title: 'Bread',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'
  }
];

const featuredRecipes = [
  {
    id: 1,
    title: 'Tartine Bread',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    duration: '48 minutes',
    type: 'Guided'
  },
  {
    id: 2,
    title: 'Tomato Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    duration: '30 minutes',
    type: 'Listed'
  },
  {
    id: 3,
    title: 'Chicken Noodles',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    duration: '30 minutes',
    type: 'Listed'
  }
];

export default function RecipesPage() {
  const router = useRouter();
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Header 
        title="Recipes" 
        imageUrl="https://images.unsplash.com/photo-1599566150163-29194dcaad36" 
      />
      <TabBar activeTab="recipes" />
      <ScrollView className="flex-1">
        {searchVisible ? (
          <View className="px-6 py-4">
            <View className="flex-row items-center bg-[#25262B] rounded-full px-4 py-2">
              <Search size={20} color="#fff" />
              <TextInput
                className="flex-1 ml-2 text-base text-white"
                placeholder="Search recipes..."
                placeholderTextColor="#666"
                autoFocus
              />
              <TouchableOpacity onPress={() => setSearchVisible(false)}>
                <Text className="text-[#4ADE80]">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-400">Good Morning</Text>
                <Text className="text-2xl font-bold text-white">Hi Jenny SO</Text>
              </View>
              <TouchableOpacity onPress={() => setSearchVisible(true)}>
                <Search size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!searchVisible && (
          <>
            <View className="px-6 pt-6">
              <Text className="text-2xl font-bold text-white mb-4">Featured Recipes</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-8"
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {featuredRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  className="mr-4 rounded-3xl overflow-hidden"
                  style={{ width: 280 }}
                >
                  <Image
                    source={{ uri: recipe.image }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/30">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-white/90 rounded-full px-3 py-1 mr-2">
                        <Text className="text-sm font-medium">{recipe.type}</Text>
                      </View>
                    </View>
                    <Text className="text-white text-xl font-bold">{recipe.title}</Text>
                    <Text className="text-white/90 mt-1">{recipe.duration}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="px-6">
              <Text className="text-2xl font-bold text-white mb-4">Categories</Text>
              <View className="flex-row flex-wrap justify-between">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className="w-[48%] mb-4 rounded-2xl overflow-hidden"
                    style={{ aspectRatio: 1 }}
                  >
                    <Image
                      source={{ uri: category.image }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/30">
                      <Text className="text-white text-lg font-bold">{category.title}</Text>
                    </View>
                  </TouchableOpacity>
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