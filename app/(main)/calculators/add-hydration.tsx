import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Droplets, X } from 'lucide-react-native';
import { insertRecords } from 'react-native-health-connect';

import { useTheme } from '../../../hooks/useTheme';

export default function AddHydration() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();
  const prefilledAmount = params.amount ? parseInt(params.amount as string) : 0;

  const [amount, setAmount] = useState(prefilledAmount.toString());
  const [time] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const waterAmount = parseInt(amount);
    if (!waterAmount || waterAmount <= 0) {
      return;
    }

    try {
      setIsSaving(true);
      
      // Create hydration record for Health Connect
      const hydrationRecord = {
        recordType: 'Hydration' as const,
        startTime: time.toISOString(),
        endTime: new Date(time.getTime() + 1000).toISOString(), // 1 second later
        volume: {
          value: waterAmount,
          unit: 'milliliters' as const,
        },
      };

      console.log('💧 Writing hydration to Health Connect:', hydrationRecord);
      
      await insertRecords([hydrationRecord]);
      
      console.log('✅ Hydration saved successfully!');
      router.back();
    } catch (error) {
      console.error('❌ Error saving hydration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1A1B1E]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Add hydration</Text>
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isSaving || !amount || parseInt(amount) <= 0}
        >
          <Text 
            className="text-base font-semibold"
            style={{ 
              color: (!amount || parseInt(amount) <= 0) ? '#666' : theme.primary 
            }}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-8">
        {/* Time Section */}
        <View className="mb-6">
          <Text className="mb-2 text-sm text-gray-400">Time</Text>
          <View className="flex-row items-center justify-between rounded-xl bg-[#2C2D32] px-4 py-4">
            <Text className="text-base text-white">Today</Text>
            <Text className="text-base text-gray-400">
              {time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>

        {/* Hydration Amount */}
        <View className="mb-6">
          <Text className="mb-2 text-sm text-gray-400">Hydration</Text>
          <View className="flex-row items-center rounded-xl bg-[#2C2D32] px-4 py-4">
            <Droplets size={24} color={theme.primary} />
            <TextInput
              className="ml-4 flex-1 text-2xl font-bold text-white"
              value={amount}
              onChangeText={setAmount}
              placeholder="Add mL"
              placeholderTextColor="#666"
              keyboardType="numeric"
              autoFocus={!prefilledAmount}
            />
            <Text className="text-base text-gray-400">ml</Text>
          </View>
          
          {/* Show in liters if > 500ml */}
          {parseInt(amount) > 500 && (
            <Text className="mt-2 text-center text-sm text-gray-500">
              {(parseInt(amount) / 1000).toFixed(2)}L
            </Text>
          )}
        </View>

        {/* Quick Presets */}
        <View className="mb-6">
          <Text className="mb-3 text-sm text-gray-400">Quick presets</Text>
          <View className="flex-row flex-wrap gap-3">
            {[100, 200, 250, 300, 500, 750, 1000, 1500].map((preset) => (
              <TouchableOpacity
                key={preset}
                onPress={() => setAmount(preset.toString())}
                className="rounded-xl bg-[#2C2D32] px-4 py-3"
                style={
                  parseInt(amount) === preset
                    ? { backgroundColor: `${theme.primary}20`, borderWidth: 1, borderColor: theme.primary }
                    : {}
                }
              >
                <Text className="text-center text-white">{preset}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info */}
        <View className="mt-4 rounded-xl bg-[#25262B] p-4">
          <Text className="text-center text-sm text-gray-400">
            💧 Recommended: Drink 30-35ml per kg of body weight daily
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
