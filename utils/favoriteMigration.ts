import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../lib/supabase';
import { getRecipesBulk } from '../services/recipeService';

/**
 * Migrate favorites from AsyncStorage to Supabase
 * This should be called once when the user first signs in
 */
export const migrateFavoritesToSupabase = async (userId: string): Promise<void> => {
  try {
    console.log('🔄 Starting favorites migration...');

    // Get favorites from AsyncStorage
    const storedFavorites = await AsyncStorage.getItem('favoriteRecipes');
    if (!storedFavorites) {
      console.log('✅ No AsyncStorage favorites to migrate');
      return;
    }

    const favoriteIds: number[] = JSON.parse(storedFavorites);
    if (favoriteIds.length === 0) {
      console.log('✅ No favorites to migrate');
      return;
    }

    console.log(`📦 Found ${favoriteIds.length} favorites in AsyncStorage`);

    // Check which favorites already exist in Supabase
    const { data: existingFavorites, error: fetchError } = await supabase
      .from('recipe_favorites')
      .select('recipe_id')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error checking existing favorites:', fetchError);
      throw fetchError;
    }

    const existingIds = new Set(existingFavorites?.map((fav) => fav.recipe_id) || []);
    const newFavoriteIds = favoriteIds.filter((id) => !existingIds.has(id));

    if (newFavoriteIds.length === 0) {
      console.log('✅ All favorites already migrated');
      // Clear AsyncStorage since all data is in Supabase
      await AsyncStorage.removeItem('favoriteRecipes');
      return;
    }

    console.log(`📥 Migrating ${newFavoriteIds.length} new favorites...`);

    // Fetch full recipe data for new favorites
    const recipes = await getRecipesBulk(newFavoriteIds);

    // Insert favorites into Supabase
    const favoritesToInsert = recipes.map((recipe) => ({
      user_id: userId,
      recipe_id: recipe.id,
      recipe_data: recipe,
    }));

    const { error: insertError } = await supabase
      .from('recipe_favorites')
      .insert(favoritesToInsert);

    if (insertError) {
      console.error('Error inserting favorites:', insertError);
      throw insertError;
    }

    console.log(`✅ Migrated ${newFavoriteIds.length} favorites to Supabase`);

    // Clear AsyncStorage after successful migration
    await AsyncStorage.removeItem('favoriteRecipes');
    console.log('✅ Cleared AsyncStorage favorites');
  } catch (error) {
    console.error('Error migrating favorites:', error);
    // Don't throw - migration failure shouldn't block app usage
  }
};

/**
 * Check if migration is needed and perform it
 */
export const checkAndMigrateFavorites = async (userId: string): Promise<void> => {
  try {
    const storedFavorites = await AsyncStorage.getItem('favoriteRecipes');
    if (storedFavorites) {
      await migrateFavoritesToSupabase(userId);
    }
  } catch (error) {
    console.error('Error checking favorites migration:', error);
  }
};
