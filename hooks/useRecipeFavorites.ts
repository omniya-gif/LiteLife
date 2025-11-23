import { useState, useEffect, useCallback } from 'react';

import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { connectSpoonacularUser, getRecipesBulk, Recipe } from '../services/recipeService';

interface RecipeFavorite {
  id: string;
  user_id: string;
  recipe_id: number;
  recipe_data?: any;
  created_at: string;
}

interface UseRecipeFavoritesReturn {
  favorites: Recipe[];
  favoriteIds: number[];
  isLoading: boolean;
  error: string | null;
  addToFavorites: (recipe: Recipe) => Promise<void>;
  removeFromFavorites: (recipeId: number) => Promise<void>;
  isFavorite: (recipeId: number) => boolean;
  refreshFavorites: () => Promise<void>;
}

/**
 * Hook to manage recipe favorites using Supabase
 * Automatically creates Spoonacular user if not exists
 */
export const useRecipeFavorites = (): UseRecipeFavoritesReturn => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ensure Spoonacular user exists for the current user
   */
  const ensureSpoonacularUser = async () => {
    try {
      if (!user) return;

      // Check if user already has Spoonacular credentials
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('spoonacular_username, spoonacular_hash')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      // If no Spoonacular credentials, create them
      if (!profile?.spoonacular_username || !profile?.spoonacular_hash) {
        console.log('🔗 Creating Spoonacular user...');

        // Generate username from email
        const username = user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`;

        // Connect to Spoonacular
        const spoonacularUser = await connectSpoonacularUser(username, user.email!);

        // Save credentials to profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            spoonacular_username: spoonacularUser.username,
            spoonacular_hash: spoonacularUser.hash,
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }

        console.log('✅ Spoonacular user created:', spoonacularUser.username);
      } else {
        console.log('✅ Spoonacular user already exists:', profile.spoonacular_username);
      }
    } catch (err) {
      console.error('Error ensuring Spoonacular user:', err);
      // Don't throw - favorites can still work without Spoonacular user
    }
  };

  /**
   * Fetch favorites from Supabase
   */
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch favorite IDs from Supabase
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('recipe_favorites')
        .select('recipe_id, recipe_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
        throw favoritesError;
      }

      const recipeIds = favoritesData?.map((fav) => fav.recipe_id) || [];
      setFavoriteIds(recipeIds);

      // If we have favorite IDs, fetch full recipe data from Spoonacular
      if (recipeIds.length > 0) {
        console.log('📦 Fetching favorite recipes:', recipeIds);
        const recipes = await getRecipesBulk(recipeIds);
        setFavorites(recipes);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error in fetchFavorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
      setFavorites([]);
      setFavoriteIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Add recipe to favorites
   */
  const addToFavorites = async (recipe: Recipe) => {
    if (!user) {
      setError('Please sign in to add favorites');
      return;
    }

    try {
      setError(null);

      // Ensure Spoonacular user exists
      await ensureSpoonacularUser();

      // Add to Supabase
      const { error: insertError } = await supabase.from('recipe_favorites').insert({
        user_id: user.id,
        recipe_id: recipe.id,
        recipe_data: recipe,
      });

      if (insertError) {
        console.error('Error adding favorite:', insertError);
        throw insertError;
      }

      console.log('✅ Added to favorites:', recipe.id);

      // Update local state
      setFavoriteIds((prev) => [...prev, recipe.id]);
      setFavorites((prev) => [recipe, ...prev]);
    } catch (err) {
      console.error('Error in addToFavorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to favorites');
      throw err;
    }
  };

  /**
   * Remove recipe from favorites
   */
  const removeFromFavorites = async (recipeId: number) => {
    if (!user) {
      setError('Please sign in to remove favorites');
      return;
    }

    try {
      setError(null);

      // Remove from Supabase
      const { error: deleteError } = await supabase
        .from('recipe_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (deleteError) {
        console.error('Error removing favorite:', deleteError);
        throw deleteError;
      }

      console.log('✅ Removed from favorites:', recipeId);

      // Update local state
      setFavoriteIds((prev) => prev.filter((id) => id !== recipeId));
      setFavorites((prev) => prev.filter((recipe) => recipe.id !== recipeId));
    } catch (err) {
      console.error('Error in removeFromFavorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove from favorites');
      throw err;
    }
  };

  /**
   * Check if recipe is favorited
   */
  const isFavorite = (recipeId: number): boolean => {
    return favoriteIds.includes(recipeId);
  };

  /**
   * Refresh favorites from Supabase
   */
  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  // Fetch favorites on mount and when user changes
  useEffect(() => {
    const initializeFavorites = async () => {
      if (user) {
        // Try to migrate AsyncStorage favorites first
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
            (m) => m.default
          );
          const storedFavorites = await AsyncStorage.getItem('favoriteRecipes');

          if (storedFavorites) {
            console.log('📦 Found AsyncStorage favorites, migrating...');
            const favoriteIds: number[] = JSON.parse(storedFavorites);

            if (favoriteIds.length > 0) {
              // Get existing favorites from Supabase
              const { data: existingFavorites } = await supabase
                .from('recipe_favorites')
                .select('recipe_id')
                .eq('user_id', user.id);

              const existingIds = new Set(existingFavorites?.map((fav) => fav.recipe_id) || []);
              const newFavoriteIds = favoriteIds.filter((id) => !existingIds.has(id));

              if (newFavoriteIds.length > 0) {
                // Fetch recipe data and insert
                const recipes = await getRecipesBulk(newFavoriteIds);
                const favoritesToInsert = recipes.map((recipe) => ({
                  user_id: user.id,
                  recipe_id: recipe.id,
                  recipe_data: recipe,
                }));

                await supabase.from('recipe_favorites').insert(favoritesToInsert);
                console.log(`✅ Migrated ${newFavoriteIds.length} favorites`);
              }
            }

            // Clear AsyncStorage after migration
            await AsyncStorage.removeItem('favoriteRecipes');
          }
        } catch (migrationError) {
          console.error('Migration error (non-blocking):', migrationError);
        }

        // Fetch all favorites from Supabase
        await fetchFavorites();
      } else {
        setFavorites([]);
        setFavoriteIds([]);
      }
    };

    initializeFavorites();
  }, [user, fetchFavorites]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites,
  };
};
