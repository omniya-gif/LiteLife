import { useMemo } from 'react';
import { useValue } from '@legendapp/state/react';
import { theme$ } from '../stores/theme';

export const useTheme = () => {
  const gender = useValue(theme$.gender);
  
  const theme = useMemo(() => {
    const isFemale = gender === 'female';
    
    return {
      // Primary accent color - Vibrant 2026 colors
      primary: isFemale ? '#FF69B4' : '#29E33C',      // Hot pink for female, vibrant green for male
      primaryLight: isFemale ? '#FFB6D9' : '#80F988', // Light pink / Light green
      primaryDark: isFemale ? '#DB5B9A' : '#1FBA2C',  // Dark pink / Dark green
      
      // Background colors - Deep dark theme
      background: '#0D0D0F',
      backgroundLight: '#1A1B1E',
      backgroundCard: '#16171A',
      backgroundDark: '#25262B',
      
      // Text colors
      textPrimary: '#FFFFFF',
      textSecondary: '#9CA3AF',
      textTertiary: '#6B7280',
      
      // Gradient colors for buttons/cards
      gradientStart: isFemale ? '#FF69B4' : '#29E33C',
      gradientEnd: isFemale ? '#FF1493' : '#1FBA2C',
      
      // Status colors
      success: '#29E33C',
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
