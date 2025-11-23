import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface RecipeIngredientsProps {
  recipe: any;
}

const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({ recipe }) => {
  const ingredients = recipe.extendedIngredients || [];

  return (
    <div className="p-6 bg-emerald-800/30 backdrop-blur-sm border border-emerald-700/30 rounded-2xl mb-8">
      <h3 className="text-xl font-bold text-yellow-400 mb-6">Ingredients</h3>
      <p className="text-sm text-gray-300 mb-4">Servings: {recipe.servings}</p>
      
      <ul className="space-y-3">
        {ingredients.map((ingredient: any, index: number) => (
          <li key={index} className="flex items-center gap-3 text-white">
            <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <span>
              {ingredient.amount} {ingredient.unit} {ingredient.name}
              {ingredient.meta?.length > 0 && (
                <span className="text-gray-300"> ({ingredient.meta.join(', ')})</span>
              )}
            </span>
          </li>
        ))}
        
        {ingredients.length === 0 && (
          <li className="text-gray-300">Ingredient information not available</li>
        )}
      </ul>
      
      <div className="mt-6 pt-4 border-t border-emerald-700/30">
        <h4 className="text-white font-semibold mb-2">Storage Tip</h4>
        <p className="text-gray-300 text-sm">
          During Ramadan, prepare ingredients in advance and store them properly to save time during meal preparation.
        </p>
      </div>
    </div>
  );
};

export default RecipeIngredients;
