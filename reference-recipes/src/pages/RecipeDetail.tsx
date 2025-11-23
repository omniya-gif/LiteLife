import React, { useState, useEffect } from 'react';
import { Moon, ArrowLeft, Clock, Users, Heart, Share2, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipeDetails, getSimilarRecipes } from '../services/recipeService';
import RecipeHeader from '../components/recipe/RecipeHeader';
import RecipeIngredients from '../components/recipe/RecipeIngredients';
import RecipeInstructions from '../components/recipe/RecipeInstructions';
import RecipeNutrition from '../components/recipe/RecipeNutrition';
import SimilarRecipes from '../components/recipe/SimilarRecipes';
// Import the image properly
import backgroundImage from '../assets/images/background.jpeg';

function RecipeDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [similarRecipes, setSimilarRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecipeData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const recipeData = await getRecipeDetails(parseInt(id));
        setRecipe(recipeData);
        
        // Check if recipe is in favorites
        const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
        setIsFavorite(favorites.includes(parseInt(id)));
        
        // Get similar recipes
        const similar = await getSimilarRecipes(parseInt(id));
        setSimilarRecipes(similar);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load recipe details. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipeData();
  }, [id]);

  const toggleFavorite = () => {
    if (!id) return;
    
    const recipeId = parseInt(id);
    const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((favId: number) => favId !== recipeId);
      localStorage.setItem('favoriteRecipes', JSON.stringify(updatedFavorites));
    } else {
      // Add to favorites
      favorites.push(recipeId);
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
    }
    
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title || 'Ramadan Recipe',
        text: `Check out this ${recipe?.type === 'suhoor' ? 'Suhoor' : 'Iftar'} recipe: ${recipe?.title}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Recipe link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-cover bg-center bg-no-repeat bg-emerald-900/95" 
         style={{ backgroundImage: `linear-gradient(to left, rgba(20, 24, 23, 0.001), rgba(10, 14, 13, 0.002)), url(${backgroundImage})` }}>
      {/* Navigation */}
      <nav className="p-4">
        <div className="container mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/recipes')} 
            className="text-yellow-400 flex items-center gap-2 hover:text-yellow-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg">Back to Recipes</span>
          </button>
          
          <div className="w-12 h-12">
            <div className="w-full h-full rounded-full bg-yellow-400/90 flex items-center justify-center">
              <Moon className="text-emerald-900 w-8 h-8" />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : error ? (
          <div className="bg-emerald-800/30 backdrop-blur-sm border border-emerald-700/30 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {error.includes('non-halal') ? 'Non-Halal Recipe Detected' : 'Error Loading Recipe'}
            </h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/recipes')}
              className="bg-yellow-400 text-emerald-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            >
              Return to Recipes
            </button>
          </div>
        ) : recipe ? (
          <div>
            {/* Recipe Image Header */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden mb-8">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 to-transparent"></div>
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={toggleFavorite}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
                    isFavorite 
                      ? 'bg-yellow-400 text-emerald-900' 
                      : 'bg-emerald-900/50 text-white hover:text-yellow-400'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button 
                  onClick={handleShare}
                  className="w-10 h-10 bg-emerald-900/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:text-yellow-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Recipe Info */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <RecipeHeader recipe={recipe} />
                
                <div className="flex flex-wrap gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span>{recipe.readyInMinutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <span>{recipe.servings} servings</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recipe Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Ingredients and Similar Recipes */}
              <div className="space-y-8">
                <RecipeIngredients recipe={recipe} />
                <SimilarRecipes recipes={similarRecipes} />
              </div>
              
              {/* Right Column - Instructions and Nutrition */}
              <div className="lg:col-span-2 space-y-8">
                <RecipeInstructions instructions={recipe.analyzedInstructions?.[0]?.steps || []} />
                <RecipeNutrition recipe={recipe} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-800/30 backdrop-blur-sm border border-emerald-700/30 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Recipe Not Found</h2>
            <p className="text-gray-300 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/recipes')}
              className="bg-yellow-400 text-emerald-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            >
              Browse Recipes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetail;