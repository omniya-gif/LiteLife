/**
 * Theme Color Mapping Utility
 * Maps hardcoded color values to theme-aware colors
 */

export const themeColorMap = {
  // Primary colors (gender-dependent)
  '#4ADE80': 'primary', // Main green/pink
  '#86EFAC': 'primaryLight', // Light green/pink
  '#22C55E': 'primaryDark', // Dark green/pink

  // Backgrounds (same for both genders)
  '#1A1B1E': 'background',
  '#25262B': 'backgroundLight',
  '#2C2D32': 'backgroundDark',

  // Status colors
  '#FBBF24': 'warning',
  '#EF4444': 'error',
  '#3B82F6': 'info',
} as const;

/**
 * Get the Tailwind class for a given color value
 * @param hexColor - The hex color to replace
 * @param prefix - The Tailwind prefix (bg, text, border, etc.)
 * @param theme - The theme object from useTheme()
 */
export const getThemeClass = (
  hexColor: string,
  prefix: 'bg' | 'text' | 'border' = 'bg',
) => {
  const themeKey = themeColorMap[hexColor as keyof typeof themeColorMap];

  if (!themeKey) {
    console.warn(`No theme mapping found for color: ${hexColor}`);
    return `${prefix}-[${hexColor}]`;
  }

  return `${prefix}-${themeKey}`;
};

/**
 * Convert hex color to theme color using the useTheme hook
 */
export const getThemeColor = (hexColor: string, theme: any): string => {
  const mapping: Record<string, string> = {
    '#4ADE80': theme.primary,
    '#86EFAC': theme.primaryLight,
    '#22C55E': theme.primaryDark,
    '#1A1B1E': theme.background,
    '#25262B': theme.backgroundLight,
    '#2C2D32': theme.backgroundDark,
    '#FF69B4': theme.primary, // Female primary
    '#FFB6D9': theme.primaryLight,
    '#DB5B9A': theme.primaryDark,
  };

  return mapping[hexColor] || hexColor;
};
