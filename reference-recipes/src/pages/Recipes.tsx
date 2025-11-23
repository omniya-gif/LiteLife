import React, { useState, useEffect } from 'react';
import { Moon, ArrowLeft, Search, Clock, Users, Heart, Utensils, Coffee, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransition } from '../contexts/TransitionContext';
import gsap from 'gsap';
import { searchRecipes } from '../services/recipeService';
import { containsNonHalalTerms, getNonHalalWarning } from '../utils/halalFilter';
// Import the image properly
import backgroundImage from '../assets/images/background.jpeg';

interface Recipe {
  id: number;
  title: string;
  image: string;
  type: 'suhoor' | 'iftar';
  time: string;
  servings: number;
  category: string;
  calories: number;
}

function Recipes() {
  const navigate = useNavigate();
  const { setIsTransitioning } = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'suhoor' | 'iftar'>('all');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch recipes based on search and filters
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setWarning(null);
      
      try {
        // Check if query contains non-halal terms
        if (containsNonHalalTerms(searchQuery)) {
          const warningMessage = getNonHalalWarning(searchQuery);
          setWarning(warningMessage);
        }
        
        const mealType = activeTab !== 'all' ? activeTab : undefined;
        const results = await searchRecipes(searchQuery, mealType);
        setRecipes(results);
      } catch (error) {
        console.error("Failed to search recipes:", error);
        // Fallback to sample data if API fails
        setRecipes([
          {
            id: 1,
            title: "Quinoa Power Bowl",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60",
            type: "suhoor",
            time: "20 mins",
            servings: 2,
            category: "Healthy",
            calories: 350
          },
          {
            id: 2,
            title: "Date and Nut Energy Balls",
            image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&auto=format&fit=crop&q=60",
            type: "suhoor",
            time: "15 mins",
            servings: 4,
            category: "Snacks",
            calories: 120
          },
          {
            id: 3,
            title: "Moroccan Harira Soup",
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=60",
            type: "iftar",
            time: "45 mins",
            servings: 6,
            category: "Traditional",
            calories: 280
          },
          {
            id: 4,
            title: "Stuffed Dates with Almonds",
            image: "https://images.unsplash.com/photo-1581014023190-cee039714597?w=800&auto=format&fit=crop&q=60",
            type: "iftar",
            time: "10 mins",
            servings: 8,
            category: "Dessert",
            calories: 90
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchRecipes();
    }, 500);

    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem('favoriteRecipes');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  const handleBack = () => {
    setIsTransitioning(true);
    const timeline = gsap.timeline({
      onComplete: () => {
        navigate('/');
        setIsTransitioning(false);
      }
    });

    timeline
      .set('.overlay__path', {
        attr: { d: 'M 100 0 H 100 c 0 50 0 50 0 100 h 0 V 0 Z' }
      })
      .to('.overlay__path', {
        duration: 0.8,
        ease: 'power3.in',
        attr: { d: 'M 100 0 H 67 c 30 54 -113 65 0 100 h 33 V 0 Z' }
      })
      .to('.overlay__path', {
        duration: 0.2,
        ease: 'power1',
        attr: { d: 'M 100 0 H 0 c 0 50 0 50 0 100 h 100 V 0 Z' }
      });
  };

  const toggleFavorite = (e: React.MouseEvent, recipeId: number) => {
    e.stopPropagation(); // Prevent navigating when clicking the heart
    
    let newFavorites: number[];
    if (favorites.includes(recipeId)) {
      newFavorites = favorites.filter(id => id !== recipeId);
    } else {
      newFavorites = [...favorites, recipeId];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
  };

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative bg-emerald-900/95"
      style={{ 
        backgroundImage: `linear-gradient(to left, rgba(10, 24, 23, 0.8), rgba(10, 44, 33, 0.9)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Navigation */}
      <nav className="bg-emerald-900/95 backdrop-blur-sm border-b border-yellow-400/20 px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <button 
            onClick={handleBack} 
            className="text-yellow-400 flex items-center gap-2 hover:text-yellow-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-semibold text-yellow-400">Ramadan Recipes</h1>
          
          <div className="w-10 h-10">
            <div className="w-full h-full rounded-full bg-yellow-400/90 flex items-center justify-center">
              <Moon className="text-emerald-900 w-6 h-6" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto flex-grow px-4 py-6">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full bg-emerald-800/50 border border-yellow-400/30 rounded-full px-5 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-yellow-400"
            />
            <Search className="absolute right-4 top-3 text-yellow-400 w-5 h-5" />
          </div>
          
          {/* Warning Message */}
          {warning && (
            <div className="bg-red-900/30 border border-red-400/50 rounded-lg p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="text-yellow-400 w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-white text-sm">{warning}</p>
            </div>
          )}
          
          {/* Category Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'all'
                  ? 'bg-yellow-400 text-emerald-900'
                  : 'bg-transparent border border-yellow-400 text-yellow-400'
              }`}
            >
              All Recipes
            </button>
            <button
              onClick={() => setActiveTab('suhoor')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'suhoor'
                  ? 'bg-yellow-400 text-emerald-900'
                  : 'bg-transparent border border-yellow-400 text-yellow-400'
              } flex items-center gap-2`}
            >
              <Coffee className="w-4 h-4" />
              Suhoor
            </button>
            <button
              onClick={() => setActiveTab('iftar')}
              className={`px-4 py-2 rounded-full ${
                activeTab === 'iftar'
                  ? 'bg-yellow-400 text-emerald-900'
                  : 'bg-transparent border border-yellow-400 text-yellow-400'
              } flex items-center gap-2`}
            >
              <Utensils className="w-4 h-4" />
              Iftar
            </button>
          </div>
        </div>
        
        {/* Recipe Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white text-lg">No recipes found. Try another search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe.id)}
                className="bg-emerald-800/40 backdrop-blur-sm border border-emerald-700/30 hover:border-yellow-400/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col"
              >
                <div className="relative h-48">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <div className={`py-1 px-3 rounded-full text-xs font-medium ${
                      recipe.type === 'suhoor' 
                        ? 'bg-blue-500/80 text-white' 
                        : 'bg-orange-500/80 text-white'
                    }`}>
                      {recipe.type === 'suhoor' ? 'Suhoor' : 'Iftar'}
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(e, recipe.id)}
                    className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      favorites.includes(recipe.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/30 text-white hover:bg-rose-500/70'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(recipe.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{recipe.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {recipe.time}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {recipe.servings}
                    </div>
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-700/50 text-yellow-400">
                      {recipe.category}
                    </span>
                    <span className="text-sm text-yellow-400 flex items-center">
                      {recipe.calories} cal
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="text-yellow-400 hover:text-yellow-500 flex items-center gap-1 text-sm">
                      View Recipe <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recipes;