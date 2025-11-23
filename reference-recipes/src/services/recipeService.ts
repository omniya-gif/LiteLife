import axios from 'axios';
import { Recipe, FeaturedRecipe } from '../types/recipe';
import { containsNonHalalTerms, getNonHalalWarning } from '../utils/halalFilter';

const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
const RAPID_API_HOST = import.meta.env.VITE_RAPID_API_HOST;

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  calories?: number;
}

interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  nutrients: {
    name: string;
    amount: number;
    unit: string;
  }[];
  dishTypes: string[];
}

export const searchRecipes = async (query: string, mealType?: string, limit = 9): Promise<Recipe[]> => {
  try {
    // Check if query contains non-halal terms - simple prevention approach
    if (containsNonHalalTerms(query)) {
      const warning = getNonHalalWarning(query);
      throw new Error(warning || 'Your search contains non-halal terms which are not permitted.');
    }

    let tags = '';
    if (mealType === 'suhoor') {
      tags = 'breakfast';
    } else if (mealType === 'iftar') {
      tags = 'dinner';
    }

    const options = {
      method: 'GET',
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch',
      params: {
        query,
        number: limit,
        tags,
        addRecipeNutrition: 'true',
        fillIngredients: 'true',
        // Add exclusion parameter for common non-halal ingredients
        excludeIngredients: 'pork,bacon,ham,alcohol,wine,beer',
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      }
    };

    const response = await axios.request(options);
    
    // Transform the response to match our Recipe interface
    return response.data.results.map((recipe: any) => {
      const calories = recipe.nutrition?.nutrients?.find(
        (nutrient: any) => nutrient.name === "Calories"
      );
      
      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        type: tags === 'breakfast' ? 'suhoor' : tags === 'dinner' ? 'iftar' : 'all',
        time: `${recipe.readyInMinutes} mins`,
        servings: recipe.servings,
        category: recipe.dishTypes?.length > 0 ? recipe.dishTypes[0] : 'Meal',
        calories: calories?.amount || 0
      };
    });
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

export const getFeaturedRecipes = async (limit = 3): Promise<FeaturedRecipe[]> => {
  try {
    const options = {
      method: 'GET',
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random',
      params: {
        number: limit,
        tags: 'vegetarian,halal'
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      }
    };

    const response = await axios.request(options);
    
    return response.data.recipes.map((recipe: any) => {
      // Randomly assign as suhoor or iftar for demonstration
      const type = Math.random() > 0.5 ? 'suhoor' : 'iftar';
      
      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.summary ? 
          recipe.summary.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : 
          'Delicious recipe for Ramadan',
        image: recipe.image,
        type: type
      };
    });
  } catch (error) {
    console.error('Error getting featured recipes:', error);
    throw error;
  }
};

export const getRecipeDetails = async (id: number): Promise<any> => {
  try {
    const options = {
      method: 'GET',
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${id}/information`,
      params: {
        includeNutrition: 'true',
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      }
    };

    const response = await axios.request(options);
    
    const recipeData = response.data;
    
    // Determine if recipe is likely for suhoor or iftar based on dish types
    let type = 'iftar';
    if (recipeData.dishTypes) {
      const breakfastTypes = ['breakfast', 'brunch', 'morning meal'];
      if (breakfastTypes.some(type => recipeData.dishTypes.includes(type))) {
        type = 'suhoor';
      }
    }
    
    return {
      ...recipeData,
      type
    };
  } catch (error) {
    console.error('Error getting recipe details:', error);
    throw error;
  }
};

export const getSimilarRecipes = async (id: number, limit = 3): Promise<any[]> => {
  try {
    const options = {
      method: 'GET',
      url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${id}/similar`,
      params: {
        number: limit
      },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      }
    };

    const response = await axios.request(options);
    
    // Transform response to include additional details
    return response.data.map((item: any) => ({
      ...item,
      image: item.image || `https://spoonacular.com/recipeImages/${item.id}-312x231.jpg`
    }));
  } catch (error) {
    console.error('Error getting similar recipes:', error);
    throw error;
  }
};
