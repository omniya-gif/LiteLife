import { useState } from 'react';
import { Platform } from 'react-native';
import { insertRecords } from 'react-native-health-connect';

interface MealData {
  name: string;
  calories: number;
  protein?: number; // in grams
  carbs?: number; // in grams
  fat?: number; // in grams
  sugar?: number; // in grams
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp?: string; // ISO string, defaults to now
  recipeId?: number; // Spoonacular recipe ID for image fetching
}

export const useHealthConnectWrite = () => {
  const [isWriting, setIsWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  /**
   * Write nutrition/meal data to Health Connect
   */
  const writeMealToHealthConnect = async (mealData: MealData): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      console.warn('Health Connect is only available on Android');
      return false;
    }

    setIsWriting(true);
    setWriteError(null);

    try {
      const startTime = mealData.timestamp || new Date().toISOString();
      // endTime must be after startTime, even if just 1 second
      const endTime = new Date(new Date(startTime).getTime() + 1000).toISOString();

      // Prepare nutrition record for Health Connect
      const nutritionRecord: any = {
        recordType: 'Nutrition',
        startTime,
        endTime,
        energy: {
          value: mealData.calories,
          unit: 'kilocalories',
        },
      };

      // Add optional macronutrients only if provided
      if (mealData.protein) {
        nutritionRecord.protein = { value: mealData.protein, unit: 'grams' };
      }
      if (mealData.carbs) {
        nutritionRecord.totalCarbohydrate = { value: mealData.carbs, unit: 'grams' };
      }
      if (mealData.fat) {
        nutritionRecord.totalFat = { value: mealData.fat, unit: 'grams' };
      }
      if (mealData.sugar) {
        nutritionRecord.sugar = { value: mealData.sugar, unit: 'grams' };
      }
      // Add meal type if provided (MEAL_TYPE_BREAKFAST = 1, LUNCH = 2, DINNER = 3, SNACK = 4)
      if (mealData.mealType) {
        const mealTypeMap: { [key: string]: number } = {
          breakfast: 1,
          lunch: 2,
          dinner: 3,
          snack: 4,
        };
        nutritionRecord.mealType = mealTypeMap[mealData.mealType.toLowerCase()] || 0;
      }
      // Add meal name with recipe ID embedded for image fetching later
      if (mealData.name) {
        // If recipeId is provided, embed it in the name: "Recipe Name #12345"
        nutritionRecord.name = mealData.recipeId 
          ? `${mealData.name} #${mealData.recipeId}`
          : mealData.name;
      }

      console.log('📝 Writing meal to Health Connect:', nutritionRecord);

      // Insert the record into Health Connect
      const result = await insertRecords([nutritionRecord]);

      console.log('✅ Meal written successfully to Health Connect:', result);
      setIsWriting(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error writing meal to Health Connect:', error);
      setWriteError(errorMessage);
      setIsWriting(false);
      return false;
    }
  };

  /**
   * Write multiple meals at once
   */
  const writeMealsToHealthConnect = async (meals: MealData[]): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      console.warn('Health Connect is only available on Android');
      return false;
    }

    setIsWriting(true);
    setWriteError(null);

    try {
      const nutritionRecords = meals.map((meal) => {
        const startTime = meal.timestamp || new Date().toISOString();
        // endTime must be after startTime, even if just 1 second
        const endTime = new Date(new Date(startTime).getTime() + 1000).toISOString();
        const record: any = {
          recordType: 'Nutrition',
          startTime,
          endTime,
          energy: {
            value: meal.calories,
            unit: 'kilocalories',
          },
        };

        if (meal.protein) {
          record.protein = { value: meal.protein, unit: 'grams' };
        }
        if (meal.carbs) {
          record.totalCarbohydrate = { value: meal.carbs, unit: 'grams' };
        }
        if (meal.fat) {
          record.totalFat = { value: meal.fat, unit: 'grams' };
        }
        // Note: mealType and name are not supported by Health Connect Nutrition records

        return record;
      });

      console.log('📝 Writing multiple meals to Health Connect:', nutritionRecords);

      const result = await insertRecords(nutritionRecords);

      console.log('✅ Meals written successfully to Health Connect:', result);
      setIsWriting(false);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error writing meals to Health Connect:', error);
      setWriteError(errorMessage);
      setIsWriting(false);
      return false;
    }
  };

  return {
    writeMealToHealthConnect,
    writeMealsToHealthConnect,
    isWriting,
    writeError,
  };
};
