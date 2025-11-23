import React from 'react';
import { Tag, Coffee, Utensils } from 'lucide-react';

interface RecipeHeaderProps {
  recipe: any;
}

const RecipeHeader: React.FC<RecipeHeaderProps> = ({ recipe }) => {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 bg-yellow-400/90 px-4 py-1 rounded-full text-emerald-900 text-sm font-semibold mb-4">
        {recipe.type === 'suhoor' ? (
          <Coffee className="w-4 h-4" />
        ) : (
          <Utensils className="w-4 h-4" />
        )}
        <span className="capitalize">{recipe.type || (recipe.dishTypes?.includes('breakfast') ? 'suhoor' : 'iftar')}</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{recipe.title}</h1>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {recipe.diets?.map((diet: string, index: number) => (
          <span 
            key={index} 
            className="flex items-center gap-1 px-3 py-1 bg-emerald-800/50 text-sm text-white rounded-full border border-emerald-700/30"
          >
            <Tag className="w-3 h-3" />
            {diet.charAt(0).toUpperCase() + diet.slice(1)}
          </span>
        ))}
        {recipe.vegetarian && (
          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-800/50 text-sm text-white rounded-full border border-emerald-700/30">
            <Tag className="w-3 h-3" />
            Vegetarian
          </span>
        )}
        {recipe.vegan && (
          <span className="flex items-center gap-1 px-3 py-1 bg-emerald-800/50 text-sm text-white rounded-full border border-emerald-700/30">
            <Tag className="w-3 h-3" />
            Vegan
          </span>
        )}
      </div>
      
      <p className="text-gray-300">
        Perfect for {recipe.type === 'suhoor' ? 'pre-dawn meal to stay energized during fasting' : 'breaking your fast at sunset'}
      </p>
    </div>
  );
};

export default RecipeHeader;
