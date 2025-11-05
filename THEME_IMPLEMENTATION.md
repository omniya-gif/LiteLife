# Dynamic Theme Implementation

## Overview
The app now supports dynamic theming based on gender selection during onboarding. When a user selects "Female", the entire app's primary color changes from green (#4ADE80) to pink (#FF69B4).

## Implementation Details

### Core Theme System

#### 1. **Theme Store** (`stores/themeStore.ts`)
- Uses Zustand with AsyncStorage persistence
- Stores the selected gender ('male' or 'female')
- Provides `getPrimaryColor()` helper method
- Automatically persists theme preference across app restarts

```typescript
gender: 'male' | 'female'
setGender: (gender) => void
getPrimaryColor: () => '#FF69B4' | '#4ADE80'
```

#### 2. **Theme Hook** (`hooks/useTheme.ts`)
- Provides easy access to theme colors throughout the app
- Returns color palette based on selected gender
- No props needed - automatically reads from themeStore

```typescript
const theme = useTheme();
// Returns:
{
  primary: '#FF69B4' (female) or '#4ADE80' (male),
  primaryLight: '#FFB6D9' or '#6EE7A0',
  primaryDark: '#FF1493' or '#22C55E',
  gradientStart: '#FF69B4' or '#4ADE80',
  gradientEnd: '#FF1493' or '#22C55E'
}
```

### Gender Selection Integration

#### Updated File: `app/(auth)/onboarding/gender.tsx`
- Added `setGender()` call in `handleGenderSelect()`
- Theme updates **immediately** when gender is selected
- No need to wait for onboarding completion
- Uses dynamic colors for:
  - Progress bar
  - Step indicator text
  - Selected gender card background
  - Continue button

```typescript
const handleGenderSelect = (gender: Gender) => {
  updateFormData({ gender });
  setGender(gender); // Updates theme immediately
};
```

### Components Using Dynamic Theme

#### ✅ Updated Components:

1. **Header.tsx** (Home page header)
   - LiteLife branding accent
   - Date icon and text
   - Profile avatar background

2. **MetricsOverview.tsx** (Today's Overview cards)
   - Metric value numbers
   - Icon colors (Activity, Droplets, Scale)

3. **Gender.tsx** (Onboarding page)
   - Progress bar
   - Step indicator
   - Selected gender card
   - Continue button

### Usage Pattern

To use the theme in any component:

```typescript
import { useTheme } from '../hooks/useTheme';

export const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View>
      {/* Method 1: Inline style */}
      <Text style={{ color: theme.primary }}>Hello</Text>
      
      {/* Method 2: Icon color prop */}
      <Icon size={24} color={theme.primary} />
      
      {/* Method 3: Background */}
      <View style={{ backgroundColor: theme.primary }}>
        ...
      </View>
    </View>
  );
};
```

## Remaining Work

### Components with Hardcoded Green (#4ADE80)

The following components still need to be updated to use dynamic theming:

#### High Priority (User-Facing):
- `app/(auth)/signin.tsx` - Sign in page back arrow
- `app/(main)/calculators/bmi.tsx` - BMI calculator UI
- `app/(main)/calculators/bmr.tsx` - BMR calculator UI  
- `app/(main)/calculators/calorie.tsx` - Calorie calculator
- `app/(main)/journal/index.tsx` - Meal journal icons and buttons
- `app/(main)/workouts/index.tsx` - Workout page icons
- `app/(main)/workouts/[id].tsx` - Workout detail page
- `app/(main)/health/index.tsx` - Health tracking icons

#### Medium Priority (Common Components):
- `components/home/AchievementScore.tsx` - Achievement badges
- `components/coins/CoinsDisplay.tsx` - Coins icon
- `components/chat/MessageInput.tsx` - Chat input icons
- `components/badges/BadgeCard.tsx` - Badge UI
- `components/notifications/NotificationBell.tsx` - Notification indicator
- `components/auth/FloatingLabelInput.tsx` - Input borders
- `components/auth/AuthTabs.tsx` - Tab indicators
- `components/auth/GradientButton.tsx` - Button gradient

#### Lower Priority (Loading/Utility):
- `components/Loader.tsx` - Loading spinner
- `components/LoadingScreen.tsx` - Full screen loader
- `providers/AuthProvider.tsx` - Auth loading indicator
- `app/auth/callback.tsx` - OAuth callback loader

### Onboarding Pages (Consistency):
All remaining onboarding pages should use the theme for consistency:
- `app/(auth)/onboarding/expertise.tsx`
- Other onboarding pages in the same folder

## Testing Checklist

- [x] Theme store persists across app restarts
- [x] Gender selection immediately updates theme
- [x] Header shows correct color based on gender
- [x] MetricsOverview shows correct color based on gender
- [x] Gender selection page uses dynamic colors
- [ ] Test switching between male/female multiple times
- [ ] Verify theme persists after closing and reopening app
- [ ] Check all updated components render correctly in both themes

## Color Palette Reference

### Female Theme (Pink)
- Primary: `#FF69B4` (Hot Pink)
- Primary Light: `#FFB6D9`
- Primary Dark: `#FF1493` (Deep Pink)

### Male Theme (Green)
- Primary: `#4ADE80` (Green)
- Primary Light: `#6EE7A0`
- Primary Dark: `#22C55E`

## Benefits

1. **Personalization**: App feels more personalized based on user preference
2. **Consistency**: All green elements automatically become pink for female users
3. **Maintainability**: Single source of truth for colors (theme hook)
4. **Persistence**: Theme preference saved and restored automatically
5. **Scalability**: Easy to add more themes in the future (e.g., custom colors, dark/light mode)

## Next Steps

1. Update remaining components listed above to use `useTheme()`
2. Test theme switching thoroughly
3. Consider adding theme preview in settings
4. Optional: Allow manual theme override in user settings
