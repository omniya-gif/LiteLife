import { useMemo } from 'react';
import { useThemeStore } from '../stores/themeStore';

export const useTheme = () => {
  const gender = useThemeStore((state) => state.gender);
  
  const theme = useMemo(() => {
    const isFemale = gender === 'female';
    
    return {
      // Primary accent color
      primary: isFemale ? '#FF69B4' : '#4ADE80',      // Hot pink for female, green for male
      primaryLight: isFemale ? '#FFB6D9' : '#86EFAC', // Light pink / Light green
      primaryDark: isFemale ? '#DB5B9A' : '#22C55E',  // Dark pink / Dark green
      
      // Background colors (same for both)
      background: '#1A1B1E',
      backgroundLight: '#25262B',
      backgroundDark: '#2C2D32',
      
      // Text colors (same for both)
      textPrimary: '#FFFFFF',
      textSecondary: '#9CA3AF',
      textTertiary: '#6B7280',
      
      // Gradient colors for buttons/cards
      gradientStart: isFemale ? '#FF69B4' : '#4ADE80',
      gradientEnd: isFemale ? '#FF1493' : '#22C55E',
      
      // Status colors (same for both)
      success: '#22C55E',
      warning: '#FBBF24',
      error: '#EF4444',
      info: '#3B82F6',
      
      // Utility
      gender: gender,
      isFemale: isFemale,
    };
  }, [gender]);
  
  return theme;
};
