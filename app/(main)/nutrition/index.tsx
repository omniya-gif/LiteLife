import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Apple, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function NutritionPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    calories: { min: '', max: '' },
    protein: { min: '', max: '' },
    carbs: { min: '', max: '' },
    fat: { min: '', max: '' }
  });

  const handleReset = () => {
    setFilters({
      calories: { min: '', max: '' },
      protein: { min: '', max: '' },
      carbs: { min: '', max: '' },
      fat: { min: '', max: '' }
    });
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching with filters:', filters);
  };

  const NutritionFilter = ({ title, unit, value, onChange }) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-2">{title} {unit && `(${unit})`}</Text>
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <TextInput
            placeholder="Min"
            value={value.min}
            onChangeText={(text) => onChange({ ...value, min: text })}
            keyboardType="numeric"
            className="bg-white px-4 py-3 rounded-xl border border-gray-200"
          />
        </View>
        <Text className="text-gray-400 self-center">-</Text>
        <View className="flex-1">
          <TextInput
            placeholder="Max"
            value={value.max}
            onChangeText={(text) => onChange({ ...value, max: text })}
            keyboardType="numeric"
            className="bg-white px-4 py-3 rounded-xl border border-gray-200"
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-4 pb-6 bg-white shadow-sm">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Apple size={24} color="#84C94B" />
            <Text className="text-2xl font-bold ml-2 text-gray-800">Nutrition Filters</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <NutritionFilter
          title="Calories"
          value={filters.calories}
          onChange={(value) => setFilters({ ...filters, calories: value })}
        />

        <NutritionFilter
          title="Protein"
          unit="g"
          value={filters.protein}
          onChange={(value) => setFilters({ ...filters, protein: value })}
        />

        <NutritionFilter
          title="Carbs"
          unit="g"
          value={filters.carbs}
          onChange={(value) => setFilters({ ...filters, carbs: value })}
        />

        <NutritionFilter
          title="Fat"
          unit="g"
          value={filters.fat}
          onChange={(value) => setFilters({ ...filters, fat: value })}
        />

        <View className="flex-row space-x-4 mt-6 mb-8">
          <TouchableOpacity
            onPress={handleSearch}
            className="flex-1 bg-[#84C94B] py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-lg">Search Recipes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            className="bg-gray-200 py-4 px-8 rounded-xl"
          >
            <Text className="text-gray-700 font-semibold">Reset</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}