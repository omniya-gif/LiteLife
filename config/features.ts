/**
 * Feature Flags Configuration
 * Toggle features for different app versions
 * 
 * v1.0 - Core Fitness (Health Tracking, Exercise Library, Calculators, Profile)
 * v1.1 - Recipes & Nutrition
 * v1.2 - Journal & Mood Tracking
 * v1.3 - AI Chat
 * v1.4 - Badges & Gamification
 */

export const APP_VERSION = '1.0.0';

export const FEATURES = {
  // ✅ v1.0 - ENABLED (Core)
  HEALTH_TRACKING: true,
  EXERCISE_LIBRARY: true,
  CALCULATORS: true,
  PROFILE: true,
  ONBOARDING: true,

  // ❌ v1.1+ - DISABLED (Future)
  RECIPES: false,
  NUTRITION: false,
  FAVORITES: false,
  MEAL_LOGGING: false,

  // ❌ v1.2+ - DISABLED
  JOURNAL: false,
  MOOD_TRACKING: false,

  // ❌ v1.3+ - DISABLED
  AI_CHAT: false,

  // ❌ v1.4+ - DISABLED
  BADGES: false,
  GAMIFICATION: false,
  HEALTH_COINS: false,

  // ❌ Future - DISABLED
  NOTIFICATIONS: false,
  SUBSCRIPTION: false,
} as const;

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

// Navigation items based on enabled features
export const getEnabledTabs = () => {
  const tabs = [
    { key: 'home', label: 'Home', icon: 'Home', route: '/home', enabled: true },
    { key: 'health', label: 'Health', icon: 'Activity', route: '/health', enabled: FEATURES.HEALTH_TRACKING },
    { key: 'workouts', label: 'Fitness', icon: 'Dumbbell', route: '/workouts', enabled: FEATURES.EXERCISE_LIBRARY },
  ];

  // Future tabs (disabled in v1.0)
  if (FEATURES.AI_CHAT) {
    tabs.splice(2, 0, { key: 'chat', label: 'Chat', icon: 'MessageCircle', route: '/chat', enabled: true });
  }
  if (FEATURES.JOURNAL) {
    tabs.push({ key: 'journal', label: 'Journal', icon: 'CalendarDays', route: '/journal', enabled: true });
  }
  if (FEATURES.FAVORITES) {
    tabs.push({ key: 'favorites', label: 'Favorites', icon: 'Heart', route: '/favorites', enabled: true });
  }

  return tabs.filter(tab => tab.enabled);
};
