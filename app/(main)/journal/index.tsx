import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import {
  ArrowLeft,
  MoreVertical,
  BarChart2,
  Utensils,
  Trash2,
  Flame,
  Coffee,
  Sun,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Calendar,
  Upload,
  Edit3,
  Book,
  X,
  Search,
  Plus,
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';

import {
  useHealthConnect,
  readNutritionData,
  readMacronutrientData,
  readCaloriesByMealType,
  readMealsByType,
} from '../../../hooks/useHealthConnect';
import { useHealthConnectWrite } from '../../../hooks/useHealthConnectWrite';
import { useTheme } from '../../../hooks/useTheme';
import { searchRecipes, Recipe } from '../../../services/recipeService';
import { useUserStore } from '../../../stores/userStore';

const { width } = Dimensions.get('window');

// Generate calendar dates dynamically
const generateCalendarDays = (baseDate: Date) => {
  const days = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    days.push({
      dayName: dayNames[date.getDay()],
      date: date.getDate(),
      fullDate: date,
      isToday: i === 0,
    });
  }
  return days;
};

export default function JournalPage() {
  const router = useRouter();
  const theme = useTheme();
  const { onboarding } = useUserStore();
  const [baseDate, setBaseDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState(generateCalendarDays(new Date()));
  const [selectedDateIndex, setSelectedDateIndex] = useState(3); // Middle day (today)
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [dailyCalories, setDailyCalories] = useState<number>(0);
  const [isLoadingCalories, setIsLoadingCalories] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showRecipeSearchModal, setShowRecipeSearchModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [meals, setMeals] = useState<any[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [searchVisible, setSearchVisible] = useState<string | null>(null); // 'breakfast', 'lunch', 'dinner', or null
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(false);
  const [macronutrients, setMacronutrients] = useState({ protein: 0, fat: 0, carbs: 0 });
  const [mealTypeCalories, setMealTypeCalories] = useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  });
  const translateX = useSharedValue(0);
  const swipeProgress = useSharedValue(0);
  const pulseAnimation = useSharedValue(0);
  const [showSwipeReminder, setShowSwipeReminder] = useState(false);

  // Health Connect integration
  const healthConnect = useHealthConnect([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'Distance' },
    { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    { accessType: 'write', recordType: 'Nutrition' },
    { accessType: 'read', recordType: 'Nutrition' },
  ]);

  const { writeMealToHealthConnect, isWriting } = useHealthConnectWrite();

  // Initialize empty meals - they will be populated from Health Connect
  useEffect(() => {
    setMeals([
      {
        id: 'breakfast',
        title: 'BREAKFAST',
        icon: <Coffee size={24} color={theme.primary} />,
        calories: 0,
        maxCalories: 450,
        items: [],
      },
      {
        id: 'lunch',
        title: 'LUNCH',
        icon: <Sun size={24} color={theme.primary} />,
        calories: 0,
        maxCalories: 850,
        items: [],
      },
      {
        id: 'dinner',
        title: 'DINNER',
        icon: <Flame size={24} color={theme.primary} />,
        calories: 0,
        maxCalories: 550,
        items: [],
      },
    ]);
    setLoadingMeals(false);
  }, [theme.primary]);

  // Continuous subtle pulse animation for swipe indicators
  useEffect(() => {
    // Start infinite pulse animation with delay
    const startPulse = setTimeout(() => {
      pulseAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite repeat
        false // don't reverse
      );
    }, 800); // Small delay so user sees the page first

    return () => clearTimeout(startPulse);
  }, []);

  // Search recipes with debounce
  useEffect(() => {
    if (!searchQuery.trim() || !searchVisible) {
      setSearchResults([]);
      return;
    }

    console.log('🔍 Search triggered:', { searchQuery, searchVisible, selectedCuisine });

    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        // Determine meal type - only breakfast is strict, others are flexible for better results
        const searchOptions: any = {};
        if (searchVisible === 'breakfast') {
          searchOptions.type = 'breakfast';
        }
        // For lunch/dinner/snack, don't restrict by type to get more cuisine results
        if (selectedCuisine && selectedCuisine !== 'all') {
          searchOptions.cuisine = selectedCuisine;
          console.log('🍽️ Adding cuisine filter:', selectedCuisine);
        }
        console.log('📡 Calling searchRecipes with:', { searchQuery, searchOptions });
        const results = await searchRecipes(searchQuery, searchOptions, 10);
        console.log('✅ Search results:', results.length, 'recipes found');
        setSearchResults(results);
      } catch (error) {
        console.error('❌ Error searching recipes:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchVisible, selectedCuisine]);

  // Auto-load popular recipes when modal opens
  useEffect(() => {
    if (showRecipeSearchModal && searchResults.length === 0 && !searchQuery) {
      const loadDefaultRecipes = async () => {
        try {
          setSearching(true);
          // Default search terms based on meal type
          const defaultSearches = {
            Breakfast: 'oatmeal',
            Lunch: 'salad',
            Dinner: 'chicken',
            Snack: 'smoothie',
          };
          const defaultQuery = defaultSearches[selectedMealType as keyof typeof defaultSearches] || 'healthy';
          const searchOptions: any = {};
          if (selectedMealType.toLowerCase() === 'breakfast') {
            searchOptions.type = 'breakfast';
          }
          console.log('🍽️ Loading default recipes:', defaultQuery);
          const results = await searchRecipes(defaultQuery, searchOptions, 10);
          setSearchResults(results);
        } catch (error) {
          console.error('Error loading default recipes:', error);
        } finally {
          setSearching(false);
        }
      };
      loadDefaultRecipes();
    }
  }, [showRecipeSearchModal, selectedMealType]);

  const handleAddRecipeToMeal = async (recipe: Recipe, mealType: string) => {
    // Write to Health Connect first
    const success = await writeMealToHealthConnect({
      name: recipe.title,
      calories: recipe.calories || 0,
      protein: recipe.protein && recipe.protein > 0 ? recipe.protein : undefined,
      carbs: recipe.carbs && recipe.carbs > 0 ? recipe.carbs : undefined,
      fat: recipe.fat && recipe.fat > 0 ? recipe.fat : undefined,
      sugar: recipe.sugar && recipe.sugar > 0 ? recipe.sugar : undefined,
      mealType: mealType.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      timestamp: new Date().toISOString(),
      recipeId: recipe.id,
    });

    if (!success) {
      Alert.alert('Error', 'Failed to add meal to Health Connect');
      return;
    }

    // Add recipe to the selected meal UI
    setMeals((prevMeals) =>
      prevMeals.map((meal) => {
        if (meal.id === mealType.toLowerCase()) {
          const newItem = {
            id: recipe.id,
            name: recipe.title,
            calories: Math.round(recipe.calories || 0),
            protein: Math.round(recipe.protein || 0),
            fat: Math.round(recipe.fat || 0),
            carbs: Math.round(recipe.carbs || 0),
            sugar: Math.round(recipe.sugar || 0),
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
          };
          return {
            ...meal,
            items: [...meal.items, newItem],
            calories: meal.calories + (recipe.calories || 0),
          };
        }
        return meal;
      })
    );

    // Close search
    setSearchVisible(null);
    setSearchQuery('');
    Alert.alert('Success', `Added "${recipe.title}" to ${mealType} and Health Connect ✅`);
  };

  // Fetch nutrition data for selected date
  useEffect(() => {
    const fetchDailyCalories = async () => {
      if (!healthConnect.hasPermissions) return;

      setIsLoadingCalories(true);
      try {
        const selectedDay = calendarDays[selectedDateIndex];
        const startOfDay = new Date(selectedDay.fullDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDay.fullDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch both calories and macronutrients
        const macros = await readMacronutrientData(
          startOfDay.toISOString(),
          endOfDay.toISOString()
        );

        // Fetch calories by meal type
        const mealCalories = await readCaloriesByMealType(
          startOfDay.toISOString(),
          endOfDay.toISOString()
        );

        // Fetch actual meals from Health Connect for each meal type
        const [breakfastMeals, lunchMeals, dinnerMeals] = await Promise.all([
          readMealsByType(startOfDay.toISOString(), endOfDay.toISOString(), 1), // breakfast
          readMealsByType(startOfDay.toISOString(), endOfDay.toISOString(), 2), // lunch
          readMealsByType(startOfDay.toISOString(), endOfDay.toISOString(), 3), // dinner
        ]);

        // Fetch images for meals with recipe IDs
        const fetchMealImages = async (meals: any[]) => {
          return Promise.all(
            meals.map(async (meal) => {
              if (meal.recipeId) {
                // Generate Spoonacular image URL from recipe ID
                const imageUrl = `https://spoonacular.com/recipeImages/${meal.recipeId}-312x231.jpg`;
                return { ...meal, image: imageUrl };
              }
              return meal;
            })
          );
        };

        const snackMeals = await readMealsByType(startOfDay.toISOString(), endOfDay.toISOString(), 4); // 4 = snack

        const [breakfastWithImages, lunchWithImages, dinnerWithImages, snackWithImages] =
          await Promise.all([
            fetchMealImages(breakfastMeals),
            fetchMealImages(lunchMeals),
            fetchMealImages(dinnerMeals),
            fetchMealImages(snackMeals),
          ]);

        // Update meals with actual data from Health Connect
        setMeals([
          {
            id: 'breakfast',
            title: 'BREAKFAST',
            icon: <Coffee size={24} color={theme.primary} />,
            calories: mealCalories.breakfast,
            maxCalories: 450,
            items: breakfastWithImages,
          },
          {
            id: 'lunch',
            title: 'LUNCH',
            icon: <Sun size={24} color={theme.primary} />,
            calories: mealCalories.lunch,
            maxCalories: 850,
            items: lunchWithImages,
          },
          {
            id: 'dinner',
            title: 'DINNER',
            icon: <Flame size={24} color={theme.primary} />,
            calories: mealCalories.dinner,
            maxCalories: 550,
            items: dinnerWithImages,
          },
          {
            id: 'snack',
            title: 'SNACK',
            icon: <Utensils size={24} color={theme.primary} />,
            calories: mealCalories.snack,
            maxCalories: 200,
            items: snackWithImages,
          },
        ]);

        setDailyCalories(macros.calories);
        setMacronutrients({
          protein: macros.protein,
          fat: macros.fat,
          carbs: macros.carbs,
        });
        setMealTypeCalories(mealCalories);
      } catch (error) {
        console.error('Error fetching daily calories:', error);
      } finally {
        setIsLoadingCalories(false);
      }
    };

    fetchDailyCalories();
  }, [selectedDateIndex, calendarDays, healthConnect.hasPermissions]);

  // Update calendar when base date changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays(baseDate));
  }, [baseDate]);

  const handlePreviousWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() - 7);
    setBaseDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + 7);
    setBaseDate(newDate);
  };

  const getCalorieColor = (calories: number | undefined) => {
    if (!calories) return theme.primary;
    if (calories > 600) return '#ff6b35'; // High calories - orange
    if (calories > 400) return '#ffa500'; // Medium-high - lighter orange
    return theme.primary; // Normal - primary color
  };

  const handleSaveMealToHealthConnect = async (mealItem: any, mealType: string) => {
    // Check if Health Connect permissions are granted
    if (!healthConnect.hasPermissions) {
      Alert.alert(
        'Health Connect Permission Required',
        'Enable Health Connect to sync your meals with Google Fit',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Grant Permission',
            onPress: async () => {
              const granted = await healthConnect.requestHealthPermissions();
              if (granted) {
                // Try saving again after permission granted
                await handleSaveMealToHealthConnect(mealItem, mealType);
              }
            },
          },
        ]
      );
      return;
    }

    const success = await writeMealToHealthConnect({
      name: mealItem.name,
      calories: mealItem.calories,
      protein: mealItem.protein,
      carbs: mealItem.carbs,
      fat: mealItem.fat,
      sugar: mealItem.sugar,
      mealType: mealType.toLowerCase(),
      timestamp: new Date().toISOString(),
      recipeId: mealItem.id,
    });
    if (success) {
      Alert.alert('✅ Success', 'Meal saved to Health Connect and will appear in Google Fit!');
    } else {
      Alert.alert('Error', 'Failed to save meal to Health Connect');
    }
  };

  const MealSection = ({ meal }) => {
    if (loadingMeals) {
      return (
        <View className="mt-4 w-full items-center py-12">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="mt-3 text-gray-400">Loading delicious recipes...</Text>
        </View>
      );
    }

    if (!meal) {
      return null;
    }

    const isSearching = searchVisible === meal.id;
    const isInExpandedView = expandedMeal;

    const getLottieSource = () => {
      switch (meal?.id) {
        case 'breakfast':
          return require('../../../assets/lottie_animations/Healthy Breaksfast.json');
        case 'lunch':
          return require('../../../assets/lottie_animations/lunch.json');
        case 'dinner':
          return require('../../../assets/lottie_animations/dinner.json');
        case 'snack':
          return require('../../../assets/lottie_animations/snack.json');
        default:
          return require('../../../assets/lottie_animations/food.json');
      }
    };

    return (
      <View className="w-full" style={{ marginTop: 8 }}>
        {/* Meal Header with Background and Calories */}
        <View
          className="mb-3 flex-row items-center justify-between rounded-2xl px-5 py-3"
          style={{ backgroundColor: `${theme.primary}15` }}>
          <View className="flex-1 flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: theme.primary }}>
              {meal.title}
            </Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-base font-semibold" style={{ color: theme.primary }}>
                {Math.round(meal.calories)} cal
              </Text>
              {/* Compact Add Button - Only show when meals exist */}
              {meal.items.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMealType(meal.title);
                    setShowAddMealModal(true);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }}>
                  <Plus size={16} color="white" strokeWidth={3} />
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 13,
                      fontWeight: '600',
                      marginLeft: 4,
                    }}>
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {isSearching && isInExpandedView && (
          <View className="mb-4">
            <View className="flex-row items-center rounded-2xl bg-[#2C2D32] px-4 py-3">
              <Search size={20} color="#666" />
              <TextInput
                className="ml-3 flex-1 text-base text-white"
                placeholder={`Search ${meal.title.toLowerCase()} recipes...`}
                placeholderTextColor="#666"
                autoFocus
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {searchQuery.length > 0 && (
              <ScrollView className="mt-3 max-h-96">
                {searching ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text className="mt-2 text-gray-400">Searching recipes...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  searchResults.map((recipe) => (
                    <TouchableOpacity
                      key={recipe.id}
                      className="mb-3 flex-row items-center rounded-2xl bg-[#25262B] p-3"
                      onPress={() => handleAddRecipeToMeal(recipe, meal.id)}>
                      <Image
                        source={{ uri: recipe.image }}
                        className="h-16 w-16 rounded-xl"
                        resizeMode="cover"
                      />
                      <View className="ml-4 flex-1">
                        <Text className="text-base font-semibold text-white" numberOfLines={2}>
                          {recipe.title}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-2">
                          <Text
                            className="text-sm font-bold"
                            style={{ color: getCalorieColor(recipe.calories) }}>
                            {Math.round(recipe.calories || 0)} cal
                          </Text>
                          {recipe.readyInMinutes && (
                            <>
                              <Text className="text-gray-600">•</Text>
                              <Text className="text-xs text-gray-500">
                                {recipe.readyInMinutes} min
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                      <View
                        className="ml-2 rounded-xl px-3 py-2"
                        style={{ backgroundColor: `${theme.primary}20` }}>
                        <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                          + Add
                        </Text>
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
        )}

        {/* Show meals from Health Connect or empty state */}
        {!isSearching && meal.items.length === 0 && (
          <View className="items-center justify-center rounded-2xl bg-[#25262B] py-1">
            <LottieView
              source={getLottieSource()}
              autoPlay
              loop
              style={{
                width: meal.id === 'breakfast' ? 120 :120,
                height: meal.id === 'breakfast' ? 120 : 120,
              }}
            />

            <Text className="mt-4 text-base text-gray-400">
              No meals added to {meal.title.toLowerCase()} yet
            </Text>
            <Text className="mt-1 text-sm text-gray-500">Tap to add your first meal</Text>

            {/* Amazing Add Button */}
            <TouchableOpacity
              onPress={() => {
                setSelectedMealType(meal.title);
                setShowAddMealModal(true);
              }}
              style={{
                marginTop: 20,
                paddingHorizontal: 32,
                paddingVertical: 14,
                backgroundColor: theme.primary,
                borderRadius: 30,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
              }}
              activeOpacity={0.8}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginRight: 8 }}>
                +
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Add Meal</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isSearching &&
          meal.items.map((item, index) => (
            <TouchableOpacity
              key={item.recipeId || index}
              className="mt-3 flex-row items-center rounded-2xl bg-[#25262B] p-3"
              onPress={() => (item.recipeId ? router.push(`/recipes/${item.recipeId}`) : null)}
              activeOpacity={item.recipeId ? 0.7 : 1}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  className="h-20 w-20 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-xl bg-[#1A1B1E]">
                  <Utensils size={32} color="#6B7280" />
                </View>
              )}
              <View className="ml-4 flex-1" style={{ paddingRight: 80, maxWidth: '70%' }}>
                <Text
                  className="text-base font-semibold text-white"
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {item.name}
                </Text>
                <View className="mt-1 flex-row flex-wrap items-center gap-2">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: getCalorieColor(item.calories) }}>
                    {Math.round(item.calories)} cal
                  </Text>
                  {item.protein > 0 && (
                    <>
                      <Text className="text-gray-600">•</Text>
                      <Text className="text-xs text-gray-500">P: {item.protein}g</Text>
                    </>
                  )}
                </View>
              </View>
              {/* No Add button - these meals are already in Health Connect */}
            </TouchableOpacity>
          ))}
      </View>
    );
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentMealIndex < meals.length - 1) {
      setCurrentMealIndex((prev) => prev + 1);
    } else if (direction === 'right' && currentMealIndex > 0) {
      setCurrentMealIndex((prev) => prev - 1);
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate on horizontal swipes (10px threshold)
    .failOffsetY([-10, 10]) // Allow vertical scrolling to take priority
    .onUpdate((event) => {
      translateX.value = event.translationX;
      // Update swipe progress for indicator animations
      swipeProgress.value = event.translationX / width;
    })
    .onEnd((event) => {
      const shouldSwipe =
        Math.abs(event.velocityX) > 500 || Math.abs(event.translationX) > width / 3;
      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        runOnJS(handleSwipe)(direction);
      }
      translateX.value = withSpring(0);
      swipeProgress.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, width / 2],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX: translateX.value }],
      opacity,
    };
  });

  // Single right-side indicator - arrow direction changes based on swipe direction
  const singleIndicatorStyle = useAnimatedStyle(() => {
    const isSwipingLeft = translateX.value < -20;
    const isSwipingRight = translateX.value > 20;
    const isActive = isSwipingLeft || isSwipingRight;
    
    const progress = isSwipingLeft
      ? interpolate(translateX.value, [-width / 2, -20, 0], [1, 0.3, 0], Extrapolate.CLAMP)
      : interpolate(translateX.value, [0, 20, width / 2], [0, 0.3, 1], Extrapolate.CLAMP);

    // Show indicator if there are multiple meals to navigate
    const hasMultipleMeals = meals.length > 1;
    
    // Pulse animation for idle state (0.3 to 0.5 opacity)
    const pulseOpacity = interpolate(pulseAnimation.value, [0, 1], [0.3, 0.5], Extrapolate.CLAMP);
    
    // Pulse scale (0.95 to 1.05 for subtle breathing effect)
    const pulseScale = interpolate(pulseAnimation.value, [0, 1], [0.95, 1.05], Extrapolate.CLAMP);

    // Horizontal swipe motion - oscillates left/right
    const swipeMotion = interpolate(pulseAnimation.value, [0, 0.5, 1], [0, -8, 0], Extrapolate.CLAMP);

    const finalOpacity = isActive ? progress : hasMultipleMeals ? pulseOpacity : 0;
    const finalScale = isActive ? 1 + progress * 0.2 : hasMultipleMeals ? pulseScale : 0.8;
    const finalTranslateX = isActive 
      ? (isSwipingLeft ? -progress * 20 : progress * 20)
      : hasMultipleMeals ? swipeMotion : 0;

    return {
      opacity: withSpring(finalOpacity, { damping: 15 }),
      transform: [
        { scale: withSpring(finalScale, { damping: 15 }) },
        { translateX: withSpring(finalTranslateX, { damping: 15 }) },
      ],
    };
  });

  // Determine arrow direction based on current position and swipe
  const getArrowDirection = () => {
    const hasNextMeal = currentMealIndex < meals.length - 1;
    const hasPreviousMeal = currentMealIndex > 0;
    
    // If swiping, show arrow in swipe direction
    if (Math.abs(translateX.value) > 20) {
      return translateX.value < 0 ? 'right' : 'left';
    }
    
    // When idle, show right if can go next, otherwise left
    return hasNextMeal ? 'right' : hasPreviousMeal ? 'left' : 'right';
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Meal Planner</Text>
        <TouchableOpacity>
          <MoreVertical size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Date Selector with Navigation */}
      <View className="mt-8 px-6">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handlePreviousWeek}
            className="rounded-full p-2"
            style={{ backgroundColor: `${theme.primary}15` }}>
            <ChevronLeft size={20} color={theme.primary} />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-white">
            {baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>

          <TouchableOpacity
            onPress={handleNextWeek}
            className="rounded-full p-2"
            style={{ backgroundColor: `${theme.primary}15` }}>
            <ChevronRight size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}>
          {calendarDays.map((day, index) => (
            <View key={`${day.fullDate.toISOString()}-${index}`} className="mx-2 items-center">
              <Text className="mb-2 text-sm text-gray-400">{day.dayName}</Text>
              <TouchableOpacity
                onPress={() => setSelectedDateIndex(index)}
                className={`h-12 w-12 items-center justify-center rounded-full ${
                  selectedDateIndex === index ? (day.isToday ? 'border-2' : '') : ''
                }`}
                style={{
                  backgroundColor:
                    selectedDateIndex === index
                      ? day.isToday
                        ? theme.primary
                        : 'white'
                      : day.isToday
                        ? `${theme.primary}20`
                        : 'transparent',
                  borderColor: selectedDateIndex === index && day.isToday ? 'white' : 'transparent',
                }}>
                <Text
                  className="text-lg font-semibold"
                  style={{
                    color:
                      selectedDateIndex === index
                        ? day.isToday
                          ? 'white'
                          : theme.primary
                        : 'white',
                  }}>
                  {day.date}
                </Text>
              </TouchableOpacity>
              {/* Indicator dot for days with data */}
              {!day.isToday && (
                <View
                  className="mt-1 h-1 w-1 rounded-full"
                  style={{ backgroundColor: theme.primary, opacity: 0.5 }}
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Daily Summary */}
      <View className="mt-8 flex-1 rounded-t-[32px] bg-[#25262B] px-6 pt-8">
        {/* Enhanced Daily Nutrition Card */}
        <View
          className="overflow-hidden rounded-3xl"
          style={{ backgroundColor: `${theme.primary}08` }}>
          <View className="p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3">
                <View className="rounded-2xl p-3" style={{ backgroundColor: theme.primary }}>
                  <Utensils size={26} color="white" />
                </View>
                <View>
                  <Text className="text-sm text-gray-400">
                    {calendarDays[selectedDateIndex].isToday
                      ? 'Today'
                      : calendarDays[selectedDateIndex].fullDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">Nutrition Summary</Text>
                </View>
              </View>
              <TouchableOpacity
                className="rounded-xl p-2"
                style={{ backgroundColor: `${theme.primary}15` }}
                onPress={() => setShowStatsModal(true)}>
                <BarChart2 size={22} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* Calories Display */}
            <View className="mt-2">
              {isLoadingCalories ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              ) : (
                <>
                  <View className="flex-row items-end">
                    <Text className="text-4xl font-bold" style={{ color: theme.primary }}>
                      {dailyCalories}
                    </Text>
                    <Text className="mb-1 ml-2 text-xl font-semibold text-gray-400">
                      / {onboarding?.daily_calories || 2850}
                    </Text>
                    <Text className="mb-1 ml-1 text-lg text-gray-500">Cal</Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="mt-4 h-3 overflow-hidden rounded-full bg-[#2C2D32]">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((dailyCalories / (onboarding?.daily_calories || 2850)) * 100, 100)}%`,
                        backgroundColor: theme.primary,
                      }}
                    />
                  </View>

                  {/* Status Text */}
                  <Text className="mt-3 text-sm text-gray-400">
                    {dailyCalories < (onboarding?.daily_calories || 2850)
                      ? `${(onboarding?.daily_calories || 2850) - dailyCalories} calories remaining to reach your goal`
                      : '🎉 Daily calorie goal achieved!'}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Swipeable Meal Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}>
          <GestureDetector gesture={panGesture}>
            <Animated.View className="relative pt-6" style={{ minHeight: 400 }}>
              {/* Single Right-Side Indicator - Arrow direction changes based on swipe */}
              {meals.length > 1 && meals[currentMealIndex]?.items && meals[currentMealIndex].items.length > 0 && (
                <Animated.View
                  style={[
                    singleIndicatorStyle,
                    {
                      position: 'absolute',
                      right: 20,
                      top: 180,
                      zIndex: 10,
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: theme.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: theme.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.5,
                      shadowRadius: 12,
                      elevation: 8,
                    },
                  ]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowSwipeReminder(true);
                      setTimeout(() => setShowSwipeReminder(false), 2500);
                    }}
                    style={{
                      width: 60,
                      height: 60,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {/* Arrow direction based on navigation state */}
                    {currentMealIndex < meals.length - 1 ? (
                      <ChevronRight size={32} color="white" strokeWidth={3} />
                    ) : (
                      <ChevronLeft size={32} color="white" strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Meal Content with Animation */}
              <Animated.View style={animatedStyle}>
                {meals.length > 0 && <MealSection meal={meals[currentMealIndex]} />}
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </ScrollView>
      </View>

      {/* Swipe Reminder Toast */}
      {showSwipeReminder && (
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.springify().damping(15)}
          style={{
            position: 'absolute',
            bottom: 100,
            left: 20,
            right: 20,
            backgroundColor: theme.primary,
            borderRadius: 20,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
            zIndex: 1000,
          }}>
          <ChevronLeft size={20} color="white" />
          <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', marginHorizontal: 12 }}>
            Swipe left or right to switch meals
          </Text>
          <ChevronRight size={20} color="white" />
        </Animated.View>
      )}

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMealModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMealModal(false)}>
        <View className="flex-1 justify-end bg-black/80">
          <View className="rounded-t-[32px] bg-[#1A1B1E] px-6 pb-10 pt-6">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold text-white">Add Meal</Text>
                <Text className="mt-1 text-sm text-gray-400">{selectedMealType}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddMealModal(false)}
                className="rounded-full p-2"
                style={{ backgroundColor: '#2C2D32' }}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View className="space-y-4">
              {/* Upload Meal Photo */}
              <TouchableOpacity
                className="rounded-2xl border-2 p-5"
                style={{
                  backgroundColor: `${theme.primary}08`,
                  borderColor: `${theme.primary}30`,
                }}
                onPress={() => {
                  // TODO: Implement upload meal logic
                  setShowAddMealModal(false);
                }}>
                <View className="flex-row items-center space-x-4">
                  <View className="rounded-2xl p-4" style={{ backgroundColor: theme.primary }}>
                    <Upload size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-bold text-white">Upload Meal Photo</Text>
                    <Text className="text-sm text-gray-400">
                      Take a photo or upload from gallery
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${theme.primary}20` }}>
                    <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
                      AI
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Manual Entry */}
              <TouchableOpacity
                className="rounded-2xl border-2 p-5"
                style={{
                  backgroundColor: `${theme.primary}08`,
                  borderColor: `${theme.primary}30`,
                }}
                onPress={() => {
                  setShowAddMealModal(false);
                  router.push({
                    pathname: '/(main)/journal/add-meal-manual',
                    params: { mealType: selectedMealType },
                  });
                }}>
                <View className="flex-row items-center space-x-4">
                  <View className="rounded-2xl p-4" style={{ backgroundColor: theme.primary }}>
                    <Edit3 size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-bold text-white">Manual Entry</Text>
                    <Text className="text-sm text-gray-400">Enter meal details manually</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Browse Recipes */}
              <TouchableOpacity
                className="rounded-2xl border-2 p-5"
                style={{
                  backgroundColor: `${theme.primary}08`,
                  borderColor: `${theme.primary}30`,
                }}
                onPress={() => {
                  setShowAddMealModal(false);
                  setShowRecipeSearchModal(true);
                }}>
                <View className="flex-row items-center space-x-4">
                  <View className="rounded-2xl p-4" style={{ backgroundColor: theme.primary }}>
                    <Book size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-bold text-white">Browse Recipes</Text>
                    <Text className="text-sm text-gray-400">Choose from our recipe library</Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: `${theme.primary}20` }}>
                    <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
                      NEW
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              className="mt-6 rounded-2xl p-4"
              style={{ backgroundColor: '#2C2D32' }}
              onPress={() => setShowAddMealModal(false)}>
              <Text className="text-center text-lg font-semibold text-white">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Recipe Search Modal */}
      <Modal
        visible={showRecipeSearchModal}
        animationType="slide"
        onRequestClose={() => {
          setShowRecipeSearchModal(false);
          setSearchQuery('');
          setSearchResults([]);
          setSelectedCuisine('all');
          setSearchVisible(null);
        }}>
        <SafeAreaView className="flex-1 bg-[#1A1B1E]">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-[#2C2D32] px-6 py-4">
            <TouchableOpacity
              onPress={() => {
                setShowRecipeSearchModal(false);
                setSearchQuery('');
                setSearchResults([]);
                setSelectedCuisine('all');
                setSearchVisible(null);
              }}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Browse Recipes</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Meal Type Badge */}
          <View className="px-6 pt-4">
            <View
              className="self-start rounded-full px-4 py-2"
              style={{ backgroundColor: `${theme.primary}20` }}>
              <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                {selectedMealType || 'MEAL'}
              </Text>
            </View>
            {/* Debug: Show what selectedMealType is */}
            {__DEV__ && (
              <Text className="mt-2 text-xs text-gray-500">
                Debug: selectedMealType = "{selectedMealType}"
              </Text>
            )}
          </View>

          {/* Search Bar */}
          <View className="px-6 pt-4">
            <View className="flex-row items-center rounded-2xl bg-[#2C2D32] px-4 py-3">
              <Search size={20} color="#666" />
              <TextInput
                className="ml-3 flex-1 text-base text-white"
                placeholder={`Search ${selectedMealType.toLowerCase()} recipes...`}
                placeholderTextColor="#666"
                autoFocus
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setSearchVisible(selectedMealType.toLowerCase());
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Cuisine Filter */}
          <View className="pt-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-6"
              contentContainerStyle={{ gap: 8 }}>
              {[
                { id: 'all', label: 'All', emoji: '🌍' },
                { id: 'american', label: 'American', emoji: '🍔' },
                { id: 'chinese', label: 'Chinese', emoji: '🥢' },
                { id: 'french', label: 'French', emoji: '🥖' },
                { id: 'greek', label: 'Greek', emoji: '🇬🇷' },
                { id: 'indian', label: 'Indian', emoji: '🍛' },
                { id: 'italian', label: 'Italian', emoji: '🍝' },
                { id: 'japanese', label: 'Japanese', emoji: '🍱' },
                { id: 'korean', label: 'Korean', emoji: '🇰🇷' },
                { id: 'mexican', label: 'Mexican', emoji: '🌮' },
                { id: 'middle eastern', label: 'Middle Eastern', emoji: '🧆' },
                { id: 'spanish', label: 'Spanish', emoji: '🥘' },
                { id: 'thai', label: 'Thai', emoji: '🍜' },
                { id: 'vietnamese', label: 'Vietnamese', emoji: '🇻🇳' },
              ].map((cuisine) => (
                <TouchableOpacity
                  key={cuisine.id}
                  onPress={() => {
                    console.log('🍽️ Cuisine selected:', cuisine.id);
                    setSelectedCuisine(cuisine.id);
                  }}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      selectedCuisine === cuisine.id ? theme.primary : '#2C2D32',
                    borderWidth: 1,
                    borderColor: selectedCuisine === cuisine.id ? theme.primary : 'transparent',
                  }}>
                  <Text
                    style={{
                      color: selectedCuisine === cuisine.id ? 'white' : '#9CA3AF',
                      fontSize: 14,
                      fontWeight: selectedCuisine === cuisine.id ? '600' : '400',
                    }}>
                    {cuisine.emoji} {cuisine.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Search Results */}
          <ScrollView className="flex-1 px-6 pt-4">
            {searching ? (
              <View className="items-center py-12">
                <ActivityIndicator size="large" color={theme.primary} />
                <Text className="mt-3 text-gray-400">
                  {searchQuery ? 'Searching recipes...' : 'Loading popular recipes...'}
                </Text>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  className="mb-4 flex-row items-center rounded-2xl bg-[#25262B] p-3"
                  onPress={async () => {
                    await handleAddRecipeToMeal(recipe, selectedMealType.toLowerCase());
                    setShowRecipeSearchModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setSelectedCuisine('all');
                  }}>
                  <Image
                    source={{ uri: recipe.image }}
                    className="h-20 w-20 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="ml-4 flex-1">
                    <Text className="text-base font-semibold text-white" numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <Text
                        className="text-sm font-bold"
                        style={{ color: getCalorieColor(recipe.calories) }}>
                        {Math.round(recipe.calories || 0)} cal
                      </Text>
                      {recipe.readyInMinutes && (
                        <>
                          <Text className="text-gray-600">•</Text>
                          <Text className="text-xs text-gray-500">
                            {recipe.readyInMinutes} min
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View
                    className="ml-2 rounded-xl px-3 py-2"
                    style={{ backgroundColor: `${theme.primary}20` }}>
                    <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                      + Add
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="items-center py-12">
                {/* Meal Type Lottie Animation */}
                <LottieView
                  source={
                    selectedMealType.toUpperCase() === 'BREAKFAST'
                      ? require('../../../assets/lottie_animations/Healthy Breaksfast.json')
                      : selectedMealType.toUpperCase() === 'LUNCH'
                        ? require('../../../assets/lottie_animations/lunch.json')
                        : selectedMealType.toUpperCase() === 'DINNER'
                          ? require('../../../assets/lottie_animations/dinner.json')
                          : require('../../../assets/lottie_animations/snack.json')
                  }
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text className="mt-4 text-base text-gray-400">No recipes found</Text>
                {selectedCuisine !== 'all' ? (
                  <View className="mt-3 items-center">
                    <Text className="mb-2 text-sm text-gray-500">Try searching for:</Text>
                    <View className="flex-row flex-wrap justify-center gap-2">
                      {(selectedMealType.toUpperCase() === 'BREAKFAST'
                        ? ['oatmeal', 'pancakes', 'eggs', 'smoothie']
                        : selectedMealType.toUpperCase() === 'LUNCH'
                          ? ['salad', 'sandwich', 'soup', 'pasta']
                          : selectedMealType.toUpperCase() === 'DINNER'
                            ? ['chicken', 'salmon', 'steak', 'curry']
                            : ['fruit', 'nuts', 'yogurt', 'granola']
                      ).map((keyword) => (
                        <TouchableOpacity
                          key={keyword}
                          onPress={() => {
                            setSearchQuery(keyword);
                            setSearchVisible(selectedMealType.toLowerCase());
                          }}
                          className="rounded-full px-3 py-1"
                          style={{ backgroundColor: `${theme.primary}15` }}>
                          <Text className="text-xs" style={{ color: theme.primary }}>
                            {keyword}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedCuisine('all')}
                      className="mt-3 rounded-full px-4 py-2"
                      style={{ backgroundColor: `${theme.primary}20` }}>
                      <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                        Clear cuisine filter
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="mt-3 items-center">
                    <Text className="mb-2 text-sm text-gray-500">Try searching for:</Text>
                    <View className="flex-row flex-wrap justify-center gap-2">
                      {(selectedMealType.toUpperCase() === 'BREAKFAST'
                        ? ['oatmeal', 'pancakes', 'eggs', 'smoothie']
                        : selectedMealType.toUpperCase() === 'LUNCH'
                          ? ['salad', 'sandwich', 'soup', 'pasta']
                          : selectedMealType.toUpperCase() === 'DINNER'
                            ? ['chicken', 'salmon', 'steak', 'curry']
                            : ['fruit', 'nuts', 'yogurt', 'granola']
                      ).map((keyword) => (
                        <TouchableOpacity
                          key={keyword}
                          onPress={() => {
                            setSearchQuery(keyword);
                            setSearchVisible(selectedMealType.toLowerCase());
                          }}
                          className="rounded-full px-3 py-1"
                          style={{ backgroundColor: `${theme.primary}15` }}>
                          <Text className="text-xs" style={{ color: theme.primary }}>
                            {keyword}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Expanded Meal View Modal */}
      <Modal
        visible={expandedMeal}
        animationType="slide"
        onRequestClose={() => {
          setExpandedMeal(false);
          setSearchVisible(null);
          setSearchQuery('');
        }}>
        <SafeAreaView className="flex-1 bg-[#1A1B1E]">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-[#2C2D32] px-6 py-4">
            <TouchableOpacity
              onPress={() => {
                setExpandedMeal(false);
                setSearchVisible(null);
                setSearchQuery('');
              }}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Meal Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Meal Tabs */}
          <View className="flex-row border-b border-[#2C2D32] px-4">
            {meals.map((meal, index) => (
              <TouchableOpacity
                key={meal.id}
                onPress={() => setCurrentMealIndex(index)}
                className="flex-1 items-center py-4"
                style={{
                  borderBottomWidth: currentMealIndex === index ? 2 : 0,
                  borderBottomColor: currentMealIndex === index ? theme.primary : 'transparent',
                }}>
                <View className="mb-1">{meal.icon}</View>
                <Text
                  className="text-xs font-semibold"
                  style={{ color: currentMealIndex === index ? theme.primary : '#666' }}>
                  {meal.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Expanded Meal Content */}
          <ScrollView className="flex-1 px-6 pt-4">
            {meals.length > 0 && <MealSection meal={meals[currentMealIndex]} />}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Detailed Stats Modal - Google Fit Style */}
      <Modal
        visible={showStatsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatsModal(false)}>
        <View className="flex-1 bg-black/70">
          <View className="mt-20 flex-1 rounded-t-[32px] bg-[#1A1B1E]">
            <View className="border-b border-[#2C2D32] p-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-white">Nutrition Details</Text>
                <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                  <Text className="text-lg" style={{ color: theme.primary }}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1 p-6">
              {/* Week View Chart */}
              <View className="mb-6">
                <Text className="mb-4 text-lg font-semibold text-white">Weekly Overview</Text>
                <View className="h-40 flex-row items-end justify-between px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const height = Math.random() * 100 + 20; // Mock data
                    return (
                      <View key={day} className="mx-1 flex-1 items-center">
                        <View
                          className="w-full rounded-t-lg"
                          style={{
                            height: `${height}%`,
                            backgroundColor: day === 'Sun' ? theme.primary : `${theme.primary}40`,
                          }}
                        />
                        <Text className="mt-2 text-xs text-gray-400">{day}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Daily Breakdown */}
              <View className="mb-6">
                <Text className="mb-4 text-lg font-semibold text-white">
                  {calendarDays[selectedDateIndex].fullDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>

                {/* Calories Card */}
                <View className="mb-4 rounded-2xl bg-[#25262B] p-5">
                  <View className="mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3">
                      <View
                        className="rounded-full p-2"
                        style={{ backgroundColor: `${theme.primary}20` }}>
                        <Flame size={24} color={theme.primary} />
                      </View>
                      <View>
                        <Text className="text-xl font-bold text-white">{dailyCalories} Cal</Text>
                        <Text className="text-sm text-gray-400">Calories consumed</Text>
                      </View>
                    </View>
                    <TrendingUp size={24} color={theme.primary} />
                  </View>

                  <View className="h-2 overflow-hidden rounded-full bg-[#2C2D32]">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((dailyCalories / (onboarding?.daily_calories || 2850)) * 100, 100)}%`,
                        backgroundColor: theme.primary,
                      }}
                    />
                  </View>
                </View>

                {/* Meal Breakdown */}
                <View className="space-y-3">
                  {meals.map((meal, index) => (
                    <View key={meal.id} className="rounded-2xl bg-[#25262B] p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-3">
                          <View
                            className="rounded-full p-2"
                            style={{ backgroundColor: `${theme.primary}15` }}>
                            {meal.icon}
                          </View>
                          <View>
                            <Text className="text-base font-semibold text-white">{meal.title}</Text>
                            <Text className="text-sm text-gray-400">{meal.items.length} items</Text>
                          </View>
                        </View>
                        <Text className="text-lg font-bold" style={{ color: theme.primary }}>
                          {Math.round(meal.calories)} cal
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tips Section */}
              <View className="mb-6 rounded-2xl bg-[#25262B] p-5">
                <View className="mb-3 flex-row items-center space-x-2">
                  <Calendar size={20} color={theme.primary} />
                  <Text className="text-base font-semibold text-white">Nutrition Tip</Text>
                </View>
                <Text className="text-sm leading-6 text-gray-400">
                  {dailyCalories < (onboarding?.daily_calories || 2850) * 0.8
                    ? "You're below your target! Try adding healthy snacks like nuts or fruits between meals."
                    : dailyCalories > (onboarding?.daily_calories || 2850)
                      ? "You've exceeded your goal. Consider lighter meals tomorrow to balance it out."
                      : "Great job! You're right on track with your nutrition goals. 🎉"}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
