import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Heart, Info, ChevronRight } from 'lucide-react-native';
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
    type: 'Guided',
    summary: 'A classic sourdough bread recipe that brings the artisanal bakery experience home.',
    dishTypes: ['breakfast', 'snack']
  },
  {
    id: 2,
    title: 'Tomato Soup',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
    duration: '30 minutes',
    type: 'Listed',
    summary: 'Creamy tomato soup with fresh basil and garlic croutons.',
    dishTypes: ['lunch', 'dinner']
  },
  {
    id: 3,
    title: 'Chicken Noodles',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    duration: '30 minutes',
    type: 'Listed',
    summary: 'Classic chicken noodle soup with tender vegetables and herbs.',
    dishTypes: ['lunch', 'dinner']
  }
];

export default function RecipesPage() {
  const router = useRouter();
  const [searchVisible, setSearchVisible] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const featuredAnim = useRef(new Animated.Value(0)).current;
  const categoryAnims = categories.map(() => useRef(new Animated.Value(0)).current);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // Header animation
    Animated.spring(headerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 10,
      friction: 2
    }).start();

    // Featured recipes animation
    Animated.spring(featuredAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 20,
      friction: 7,
      delay: 300
    }).start();

    // Staggered category animations
    categoryAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
        delay: 500 + (index * 100)
      }).start();
    });
  }, []);

  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: searchVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease)
    }).start();
  }, [searchVisible]);

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      <Animated.View style={{
        opacity: headerAnim,
        transform: [
          { scale: headerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1]
          })}
        ]
      }}>
        <Header 
          title="Recipes" 
          imageUrl="https://images.unsplash.com/photo-1599566150163-29194dcaad36" 
        />
        <TabBar activeTab="recipes" />
      </Animated.View>

      <ScrollView className="flex-1">
        <Animated.View style={{
          opacity: searchVisible ? searchAnim : 1,
          transform: [{
            translateY: searchAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0]
            })
          }]
        }}>
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
        </Animated.View>

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
              {featuredRecipes.map((recipe, index) => (
                <Animated.View 
                  key={recipe.id} 
                  style={{
                    transform: [{
                      translateX: featuredAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100 * (index + 1), 0]
                      })
                    }],
                    opacity: featuredAnim
                  }}
                >
                  <TouchableOpacity 
                    onPress={() => router.push(`/recipes/${recipe.id}`)}
                    className="mr-4 bg-[#25262B] rounded-3xl overflow-hidden"
                    style={{ width: 280 }}
                  >
                    <View className="relative">
                      <Image
                        source={{ uri: recipe.image }}
                        className="w-full h-40"
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        onPress={() => toggleFavorite(recipe.id)}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 items-center justify-center"
                      >
                        <Heart 
                          size={20} 
                          color={favorites.includes(recipe.id) ? '#4ADE80' : 'white'}
                          fill={favorites.includes(recipe.id) ? '#4ADE80' : 'transparent'}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="p-4">
                      <Text className="text-[#4ADE80] text-sm font-medium mb-2">
                        {recipe.dishTypes[0]?.toUpperCase()}
                      </Text>
                      <Text className="text-white text-lg font-medium mb-2">
                        {recipe.title}
                      </Text>
                      <Text className="text-gray-400 text-sm mb-4" numberOfLines={2}>
                        {recipe.summary}
                      </Text>

                      {/* Action Buttons */}
                      <View className="flex-row justify-between">
                        <TouchableOpacity 
                          onPress={() => router.push('/journal')}
                          className="flex-1 h-12 bg-[#4ADE80] rounded-xl items-center justify-center mr-2"
                        >
                          <Text className="text-white font-medium">Add to Journal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          onPress={() => router.push(`/recipes/${recipe.id}/nutrition`)}
                          className="h-12 w-12 bg-[#2C2D32] rounded-xl items-center justify-center mx-2"
                        >
                          <Info size={20} color="#4ADE80" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          onPress={() => router.push(`/recipes/${recipe.id}`)}
                          className="h-12 w-12 bg-[#2C2D32] rounded-xl items-center justify-center"
                        >
                          <ChevronRight size={20} color="#4ADE80" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>

            <View className="px-6">
              <Text className="text-2xl font-bold text-white mb-4">Categories</Text>
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
                          })
                        }
                      ]
                    }}
                  >
                    <TouchableOpacity
                      className="rounded-2xl overflow-hidden"
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