import React from 'react';
import { Droplets, Apple, Beef, Cookie } from 'lucide-react';

interface RecipeNutritionProps {
  recipe: any;
}

const RecipeNutrition: React.FC<RecipeNutritionProps> = ({ recipe }) => {
  // Extract nutrition data from recipe
  const calories = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0;
  const protein = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
  const carbs = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
  const fat = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0;
  const fiber = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fiber')?.amount || 0;
  const sugar = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Sugar')?.amount || 0;

  return (
    <div className="h-full p-6 bg-emerald-800/30 backdrop-blur-sm border border-emerald-700/30 rounded-2xl">
      <h3 className="text-xl font-bold text-yellow-400 mb-6">Nutritional Information</h3>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-white">Calories</span>
        <span className="text-lg font-bold text-yellow-400">{calories.toFixed(0)}</span>
      </div>
      
      {/* Nutrition gauge - demonstrates percentage of daily value */}
      <div className="w-full h-3 bg-emerald-800 rounded-full mb-6">
        <div 
          className="h-full bg-yellow-400 rounded-full" 
          style={{ width: `${Math.min((calories / 2000) * 100, 100)}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-800/50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Beef className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Protein</span>
            </div>
            <span className="text-white font-medium">{protein.toFixed(1)}g</span>
          </div>
          <div className="w-full h-2 bg-emerald-900 rounded-full">
            <div 
              className="h-full bg-yellow-400 rounded-full" 
              style={{ width: `${Math.min((protein / 50) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="p-4 bg-emerald-800/50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Carbs</span>
            </div>
            <span className="text-white font-medium">{carbs.toFixed(1)}g</span>
          </div>
          <div className="w-full h-2 bg-emerald-900 rounded-full">
            <div 
              className="h-full bg-yellow-400 rounded-full" 
              style={{ width: `${Math.min((carbs / 300) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="p-4 bg-emerald-800/50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Fat</span>
            </div>
            <span className="text-white font-medium">{fat.toFixed(1)}g</span>
          </div>
          <div className="w-full h-2 bg-emerald-900 rounded-full">
            <div 
              className="h-full bg-yellow-400 rounded-full" 
              style={{ width: `${Math.min((fat / 70) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="p-4 bg-emerald-800/50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Sugar</span>
            </div>
            <span className="text-white font-medium">{sugar.toFixed(1)}g</span>
          </div>
          <div className="w-full h-2 bg-emerald-900 rounded-full">
            <div 
              className="h-full bg-yellow-400 rounded-full" 
              style={{ width: `${Math.min((sugar / 50) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-emerald-700/30">
        <h4 className="text-white font-semibold mb-2">Ramadan Tip</h4>
        <p className="text-gray-300 text-sm">
          {recipe.type === 'suhoor' ? 
            'For Suhoor, high protein and complex carbs help sustain energy during fasting hours.' :
            'For Iftar, start with dates and water, then eat slowly to aid digestion after a day of fasting.'}
        </p>
      </div>
    </div>
  );
};

export default RecipeNutrition;
