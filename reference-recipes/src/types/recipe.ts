export interface Recipe {
  id: number;
  title: string;
  image: string;
  type: 'suhoor' | 'iftar';
  time: string;
  servings: number;
  category: string;
  calories: number;
}

export interface FeaturedRecipe {
  id: number;
  title: string;
  description: string;
  image: string;
  type: 'suhoor' | 'iftar';
}
