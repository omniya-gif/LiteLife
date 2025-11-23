import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SimilarRecipesProps {
  recipes: any[];
}

const SimilarRecipes: React.FC<SimilarRecipesProps> = ({ recipes }) => {
  return (
    <div className="p-6 bg-emerald-800/30 backdrop-blur-sm border border-emerald-700/30 rounded-2xl">
      <h3 className="text-xl font-bold text-yellow-400 mb-6">You Might Also Like</h3>
      
      <div className="space-y-4">
        {recipes.slice(0, 3).map((recipe) => (
          <Link 
            key={recipe.id} 
            to={`/recipe/${recipe.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-800/50 transition-colors group"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {recipe.image ? (
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-700 flex items-center justify-center text-white text-xs">
                  No Image
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <h4 className="text-white font-medium line-clamp-1 group-hover:text-yellow-400 transition-colors">
                {recipe.title}
              </h4>
              
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Clock className="w-3 h-3 text-yellow-400" />
                <span>{recipe.readyInMinutes || '30'} mins</span>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
        
        {recipes.length === 0 && (
          <p className="text-gray-300 text-sm">No similar recipes found</p>
        )}
      </div>
    </div>
  );
};

export default SimilarRecipes;
