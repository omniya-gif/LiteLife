import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, ChevronDown } from 'lucide-react-native';

import { useTheme } from '../../../hooks/useTheme';

export default function AddMealManual() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const mealType = params.mealType as string || 'Not set';

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(mealType);
  const [showMealTypePicker, setShowMealTypePicker] = useState(false);

  // Nutrition fields
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [servingSize, setServingSize] = useState('');

  const mealTypes = ['Not set', 'Unknown', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const handleSave = () => {
    if (!mealName.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }
    if (!calories.trim()) {
      Alert.alert('Error', 'Please enter calories');
      return;
    }

    // TODO: Implement save logic
    Alert.alert('Success', 'Meal saved successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const NutritionInput = ({ 
    label, 
    value, 
    onChangeText, 
    unit,
    placeholder = '0'
  }: { 
    label: string; 
    value: string; 
    onChangeText: (text: string) => void; 
    unit: string;
    placeholder?: string;
  }) => (
    <View className="mb-4">
      <Text className="text-sm text-gray-400 mb-2">{label}</Text>
      <View className="flex-row items-center rounded-xl bg-[#2C2D32] px-4 py-3">
        <TextInput
          className="flex-1 text-white text-base"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
        <Text className="text-gray-400 ml-2">{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Add a meal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Time Section */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-4">Time</Text>
          
          {/* Date Picker */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between rounded-xl bg-[#2C2D32] px-4 py-4 mb-3"
          >
            <View className="flex-row items-center space-x-3">
              <Calendar size={20} color={theme.primary} />
              <Text className="text-white text-base">
                {date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Time Picker */}
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="flex-row items-center justify-between rounded-xl bg-[#2C2D32] px-4 py-4"
          >
            <View className="flex-row items-center space-x-3">
              <Clock size={20} color={theme.primary} />
              <Text className="text-white text-base">
                {time.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </TouchableOpacity>


        </View>

        {/* Meal Type */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-4">Meal type</Text>
          <TouchableOpacity
            onPress={() => setShowMealTypePicker(!showMealTypePicker)}
            className="rounded-xl bg-[#2C2D32] px-4 py-4"
          >
            <Text className="text-white text-base">{selectedMealType}</Text>
          </TouchableOpacity>

          {showMealTypePicker && (
            <View className="mt-2 rounded-xl bg-[#25262B] overflow-hidden">
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setSelectedMealType(type);
                    setShowMealTypePicker(false);
                  }}
                  className="px-4 py-4 border-b border-[#2C2D32]"
                  style={{
                    backgroundColor: selectedMealType === type ? `${theme.primary}15` : 'transparent'
                  }}
                >
                  <Text 
                    className="text-base"
                    style={{ color: selectedMealType === type ? theme.primary : 'white' }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Meal Name */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-4">Meal name</Text>
          <TextInput
            className="rounded-xl bg-[#2C2D32] px-4 py-4 text-white text-base"
            value={mealName}
            onChangeText={setMealName}
            placeholder="e.g., Grilled Chicken Salad"
            placeholderTextColor="#666"
          />
        </View>

        {/* Serving Size */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-4">Serving size (optional)</Text>
          <TextInput
            className="rounded-xl bg-[#2C2D32] px-4 py-4 text-white text-base"
            value={servingSize}
            onChangeText={setServingSize}
            placeholder="e.g., 1 cup, 150g"
            placeholderTextColor="#666"
          />
        </View>

        {/* Nutrition Information */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-4">Nutrition Information</Text>
          
          <NutritionInput
            label="Calories *"
            value={calories}
            onChangeText={setCalories}
            unit="kcal"
          />

          <NutritionInput
            label="Protein"
            value={protein}
            onChangeText={setProtein}
            unit="g"
          />

          <NutritionInput
            label="Carbohydrates"
            value={carbs}
            onChangeText={setCarbs}
            unit="g"
          />

          <NutritionInput
            label="Total Fat"
            value={fat}
            onChangeText={setFat}
            unit="g"
          />

          <NutritionInput
            label="Dietary Fiber"
            value={fiber}
            onChangeText={setFiber}
            unit="g"
          />

          <NutritionInput
            label="Sugar"
            value={sugar}
            onChangeText={setSugar}
            unit="g"
          />

          <NutritionInput
            label="Sodium"
            value={sodium}
            onChangeText={setSodium}
            unit="mg"
          />

          <NutritionInput
            label="Cholesterol"
            value={cholesterol}
            onChangeText={setCholesterol}
            unit="mg"
          />
        </View>

        {/* More Details Link */}
        <TouchableOpacity className="mb-8">
          <Text className="text-base" style={{ color: theme.primary }}>
            More details
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View className="px-6 pb-6 pt-4 border-t border-[#2C2D32]">
        <TouchableOpacity
          onPress={handleSave}
          className="rounded-2xl py-4"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-center text-lg font-bold text-white">
            Save Meal
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
