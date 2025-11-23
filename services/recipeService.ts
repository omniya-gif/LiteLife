import Constants from 'expo-constants';

// Get API credentials from app.config.ts extra field
const RAPID_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_RAPID_API_KEY;
const RAPID_API_HOST = Constants.expoConfig?.extra?.EXPO_PUBLIC_RAPID_API_HOST;

// Debug: Log API configuration (remove in production)
console.log('🔑 Recipe API Config:', {
  hasKey: !!RAPID_API_KEY,
  hasHost: !!RAPID_API_HOST,
  keyPreview: RAPID_API_KEY ? `${RAPID_API_KEY.slice(0, 10)}...` : 'missing',
  host: RAPID_API_HOST || 'missing',
});

export interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  calories?: number;
  dishTypes?: string[];
  summary?: string;
}

export interface RecipeDetails extends Recipe {
  extendedIngredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
  analyzedInstructions: {
    steps: {
      number: number;
      step: string;
    }[];
  }[];
  nutrition?: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
}

/**
 * Search for recipes using Spoonacular API
 * @param query - Search term
 * @param options - Search options (diet, cuisine, type, etc.)
 * @param limit - Number of results
 */
export const searchRecipes = async (
  query: string,
  options?: {
    diet?: string; // vegetarian, vegan, etc.
    cuisine?: string; // italian, mexican, etc.
    type?: string; // main course, dessert, etc.
    excludeIngredients?: string; // comma separated
  },
  limit = 12
): Promise<Recipe[]> => {
  try {
    // Validate API credentials
    if (!RAPID_API_KEY || !RAPID_API_HOST) {
      throw new Error('API credentials not configured. Check your .env file.');
    }

    const params = new URLSearchParams({
      query,
      number: limit.toString(),
      addRecipeNutrition: 'true',
      fillIngredients: 'false',
      instructionsRequired: 'true',
      // Exclude common non-halal ingredients
      excludeIngredients: options?.excludeIngredients || 'pork,bacon,ham,alcohol,wine,beer,lard',
    });

    if (options?.diet) params.append('diet', options.diet);
    if (options?.cuisine) params.append('cuisine', options.cuisine);
    if (options?.type) params.append('type', options.type);

    const url = `https://${RAPID_API_HOST}/recipes/complexSearch?${params.toString()}`;
    console.log('🔍 Searching recipes:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
    });

    console.log('📡 Search response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return data.results.map((recipe: any) => {
      const calories = recipe.nutrition?.nutrients?.find(
        (nutrient: any) => nutrient.name === 'Calories'
      );

      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        calories: calories?.amount || 0,
        dishTypes: recipe.dishTypes || [],
        summary: recipe.summary || '',
      };
    });
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

/**
 * Get featured/random recipes
 * @param limit - Number of recipes to fetch
 * @param tags - Tags to filter (e.g., 'vegetarian,dessert')
 */
export const getFeaturedRecipes = async (limit = 6, tags?: string): Promise<Recipe[]> => {
  try {
    // Validate API credentials
    if (!RAPID_API_KEY || !RAPID_API_HOST) {
      throw new Error('API credentials not configured. Check your .env file.');
    }

    const params = new URLSearchParams({
      number: limit.toString(),
      includeNutrition: 'true',
    });

    if (tags) params.append('tags', tags);

    const url = `https://${RAPID_API_HOST}/recipes/random?${params.toString()}`;
    console.log('🎲 Getting featured recipes:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
    });

    console.log('📡 Featured response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Received recipes:', data.recipes?.length || 0);

    return data.recipes.map((recipe: any) => {
      // Extract calories from nutrition data if available
      const calories = recipe.nutrition?.nutrients?.find(
        (nutrient: any) => nutrient.name === 'Calories'
      );

      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        calories: calories?.amount || 0,
        dishTypes: recipe.dishTypes || [],
        summary: recipe.summary
          ? recipe.summary.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...'
          : '',
      };
    });
  } catch (error) {
    console.error('Error getting featured recipes:', error);
    throw error;
  }
};

/**
 * Get detailed recipe information
 * @param id - Recipe ID
 */
export const getRecipeDetails = async (id: number): Promise<RecipeDetails> => {
  try {
    const response = await fetch(
      `https://${RAPID_API_HOST}/recipes/${id}/information?includeNutrition=true`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEY!,
          'X-RapidAPI-Host': RAPID_API_HOST!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting recipe details:', error);
    throw error;
  }
};

/**
 * Get similar recipes
 * @param id - Recipe ID
 * @param limit - Number of similar recipes
 */
export const getSimilarRecipes = async (id: number, limit = 6): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `https://${RAPID_API_HOST}/recipes/${id}/similar?number=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEY!,
          'X-RapidAPI-Host': RAPID_API_HOST!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      image: item.image || `https://spoonacular.com/recipeImages/${item.id}-312x231.jpg`,
      readyInMinutes: item.readyInMinutes || 0,
      servings: item.servings || 0,
    }));
  } catch (error) {
    console.error('Error getting similar recipes:', error);
    throw error;
  }
};

/**
 * Get recipes by category
 * @param type - Meal type (breakfast, lunch, dinner, dessert, etc.)
 * @param limit - Number of recipes
 */
export const getRecipesByCategory = async (type: string, limit = 12): Promise<Recipe[]> => {
  try {
    return await searchRecipes('', { type }, limit);
  } catch (error) {
    console.error('Error getting recipes by category:', error);
    throw error;
  }
};

/**
 * Connect user to Spoonacular API
 * @param username - Desired Spoonacular username
 * @param email - User email
 */
export const connectSpoonacularUser = async (
  username: string,
  email: string
): Promise<{ username: string; hash: string }> => {
  try {
    if (!RAPID_API_KEY || !RAPID_API_HOST) {
      throw new Error('API credentials not configured.');
    }

    const url = `https://${RAPID_API_HOST}/users/connect`;
    console.log('🔗 Connecting Spoonacular user:', username, email);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.toLowerCase(),
        email,
      }),
    });

    console.log('📡 Connect response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      username: data.username,
      hash: data.hash,
    };
  } catch (error) {
    console.error('Error connecting Spoonacular user:', error);
    throw error;
  }
};

/**
 * Get bulk recipe information by IDs
 * @param ids - Array of recipe IDs
 */
export const getRecipesBulk = async (ids: number[]): Promise<Recipe[]> => {
  try {
    if (!ids || ids.length === 0) {
      return [];
    }

    if (!RAPID_API_KEY || !RAPID_API_HOST) {
      throw new Error('API credentials not configured.');
    }

    const url = `https://${RAPID_API_HOST}/recipes/informationBulk?ids=${ids.join(',')}&includeNutrition=true`;
    console.log('📦 Getting bulk recipes:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
    });

    console.log('📡 Bulk response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return data.map((recipe: any) => {
      const calories = recipe.nutrition?.nutrients?.find(
        (nutrient: any) => nutrient.name === 'Calories'
      );

      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        calories: calories?.amount || 0,
        dishTypes: recipe.dishTypes || [],
        summary: recipe.summary || '',
      };
    });
  } catch (error) {
    console.error('Error getting bulk recipes:', error);
    throw error;
  }
};
